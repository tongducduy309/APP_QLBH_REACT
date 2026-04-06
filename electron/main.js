const { app, BrowserWindow, Menu, dialog, shell, Notification, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const net = require('net');
const os = require('os');

let backendProc = null;

ipcMain.handle('print:pdf:silent', async (event, payload) => {
  const { bytes, fileName = 'print.pdf', copies = 1, deviceName } = payload || {};
  if (!bytes || !Array.isArray(bytes)) return { ok: false, error: 'Missing bytes' };

  const tmpPath = path.join(os.tmpdir(), `qlbh_${Date.now()}_${fileName}`);
  fs.writeFileSync(tmpPath, Buffer.from(bytes));

  const pdfWin = new BrowserWindow({
    show: false,
    webPreferences: {
      plugins: true,
      sandbox: true
    }
  });

  try {
    await pdfWin.loadURL(`file://${tmpPath}`);
    await new Promise((r) => setTimeout(r, 300));

    const result = await new Promise((resolve) => {
      pdfWin.webContents.print(
        {
          silent: true,
          printBackground: true,
          copies: Math.max(1, Math.min(50, Number(copies) || 1)),
          deviceName: deviceName || undefined
        },
        (success, failureReason) => resolve({ success, failureReason })
      );
    });

    pdfWin.close();
    try { fs.unlinkSync(tmpPath); } catch {}

    if (!result.success) return { ok: false, error: result.failureReason || 'Print failed' };
    return { ok: true };
  } catch (err) {
    try { pdfWin.close(); } catch {}
    try { fs.unlinkSync(tmpPath); } catch {}
    return { ok: false, error: String(err?.message || err) };
  }
});

function firstExisting(paths) {
  return paths.find((p) => fs.existsSync(p));
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function getLogStream() {
  const logsDir = path.join(app.getPath('userData'), 'logs');
  ensureDir(logsDir);
  const logFile = path.join(logsDir, 'backend.log');
  const log = fs.createWriteStream(logFile, { flags: 'a' });
  return { log, logFile };
}

function getJavaPath() {
  const exe = process.platform === 'win32' ? 'java.exe' : 'java';
  const candidates = [
    path.join(process.resourcesPath, 'jre', 'bin', exe),
    path.join(__dirname, '..', 'jre', 'bin', exe)
  ];
  return firstExisting(candidates) || 'java';
}

function getJarPath() {
  const candidates = [
    path.join(process.resourcesPath, 'backend', 'app.jar'),
    path.join(__dirname, '..', 'backend', 'app.jar')
  ];
  return firstExisting(candidates);
}

function makeBackupPath(dir, base = 'database.db') {
  const ts = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .replace(/\..+/, '');
  const name = base.replace(/\.db$/i, `.${ts}.bak`);
  return path.join(dir, name);
}

function prepareDatabase() {
  const { log } = getLogStream();

  const home = process.env.USERPROFILE || process.env.HOME;
  const dataDir = path.join(home, '.qlbh');
  ensureDir(dataDir);

  const dbPath = path.join(dataDir, 'database.db');
  const promptMarkerDir = app.getPath('userData');
  ensureDir(promptMarkerDir);
  const promptMarker = path.join(promptMarkerDir, 'db_prompt_done');

  const seed = firstExisting([
    path.join(process.resourcesPath, 'resources', 'seed.db'),
    path.join(__dirname, '..', 'resources', 'seed.db')
  ]);

  if (!fs.existsSync(dbPath)) {
    if (seed) {
      fs.copyFileSync(seed, dbPath);
      log.write(`[DB] Created new DB from seed: ${seed}\n`);
    } else {
      fs.closeSync(fs.openSync(dbPath, 'w'));
      log.write('[DB] Created empty DB (seed not found)\n');
    }
    fs.writeFileSync(promptMarker, 'done', 'utf8');
    return dbPath;
  }

  let shouldAsk = true;
  if (fs.existsSync(promptMarker) && !process.env.QLBH_ASK_OVERWRITE) {
    shouldAsk = false;
  }

  if (!shouldAsk) {
    log.write('[DB] Existing DB found. Skip prompt this run.\n');
    return dbPath;
  }

  if (!seed) {
    log.write('[DB] Existing DB found but no seed.db to overwrite with. Skipping prompt.\n');
    fs.writeFileSync(promptMarker, 'done', 'utf8');
    return dbPath;
  }

  const result = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Giữ nguyên', 'Ghi đè', 'Sao lưu rồi ghi đè'],
    defaultId: 0,
    cancelId: 0,
    title: 'Cơ sở dữ liệu',
    message: 'Đã phát hiện cơ sở dữ liệu hiện có.\nBạn muốn làm gì với dữ liệu hiện tại?',
    detail:
      `• Vị trí DB: ${dbPath}\n• Seed: ${seed}\n\n` +
      'Giữ nguyên: dùng dữ liệu hiện tại.\n' +
      'Ghi đè: thay bằng seed.db (mất dữ liệu cũ).\n' +
      'Sao lưu rồi ghi đè: lưu file .bak rồi thay bằng seed.'
  });

  try {
    if (result === 1) {
      fs.copyFileSync(seed, dbPath);
      log.write('[DB] Overwritten DB with seed (no backup).\n');
    } else if (result === 2) {
      const backupPath = makeBackupPath(dataDir, 'database.db');
      fs.copyFileSync(dbPath, backupPath);
      fs.copyFileSync(seed, dbPath);
      log.write(`[DB] Backed up to: ${backupPath}\n[DB] Overwritten DB with seed.\n`);
    } else {
      log.write('[DB] Kept existing DB.\n');
    }
  } catch (err) {
    log.write(`[DB] ERROR while handling overwrite: ${err?.stack || err}\n`);
    dialog.showErrorBox('Lỗi CSDL', 'Không thể xử lý ghi đè/sao lưu CSDL. Xem log để biết chi tiết.');
  } finally {
    fs.writeFileSync(promptMarker, 'done', 'utf8');
  }

  return dbPath;
}

function waitForPort(host, port, timeoutMs = 40000, intervalMs = 400) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    (function tryOnce() {
      const socket = net.createConnection({ host, port }, () => {
        socket.end();
        resolve(true);
      });

      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          return reject(new Error('Timeout waiting for backend'));
        }
        setTimeout(tryOnce, intervalMs);
      });
    })();
  });
}

function startBackend() {
  const { log, logFile } = getLogStream();
  const javaPath = getJavaPath();
  const jarPath = getJarPath();
  const dbPath = prepareDatabase();
  const jdbcDbPath = dbPath.replace(/\\/g, '/');
  const port = process.env.BACKEND_PORT || '18080';

  log.write(`\n=== START ${new Date().toISOString()} ===${os.EOL}`);
  log.write(`isPackaged=${app.isPackaged}${os.EOL}`);
  log.write(`resourcesPath=${process.resourcesPath}${os.EOL}`);
  log.write(`javaPath=${javaPath}${os.EOL}`);
  log.write(`jarPath=${jarPath}${os.EOL}`);
  log.write(`dbPath=${dbPath}${os.EOL}`);
  log.write(`port=${port}${os.EOL}`);

  if (!jarPath) {
    dialog.showErrorBox('Lỗi khởi động', 'Không tìm thấy backend app.jar.');
    log.write(`[FATAL] jarPath not found${os.EOL}`);
    log.end();
    return null;
  }

  const args = [
    '-Dspring.output.ansi.enabled=never',
    '-jar',
    jarPath,
    `--server.port=${port}`,
    `--spring.datasource.url=jdbc:sqlite:${jdbcDbPath}`,
    '--spring.datasource.driver-class-name=org.sqlite.JDBC'
  ];

  backendProc = spawn(javaPath, args, {
    cwd: path.dirname(jarPath),
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendProc.stdout.on('data', (d) => log.write(d));
  backendProc.stderr.on('data', (d) => log.write(d));

  backendProc.on('exit', (code) => {
    log.write(`\n=== EXIT code=${code} ${new Date().toISOString()} ===${os.EOL}`);
    log.end();
  });

  backendProc.on('error', (err) => {
    log.write(`\n[spawn error] ${err?.stack || err}${os.EOL}`);
  });

  return { port, logFile };
}

function stopBackend() {
  if (backendProc && !backendProc.killed) {
    try {
      if (process.platform === 'win32') backendProc.kill();
      else backendProc.kill('SIGTERM');
    } catch {}
  }
}

function loadFrontend(win) {
  const candidates = [
    path.join(process.resourcesPath, 'dist', 'index.html'),
    path.join(__dirname, '..', 'dist', 'index.html')
  ];

  const indexPath = firstExisting(candidates);
  if (!indexPath) {
    dialog.showErrorBox('Lỗi', 'Không tìm thấy file giao diện React (dist/index.html).');
    return false;
  }

  win.loadFile(indexPath);
  return true;
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#FFF8E1',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.removeMenu();
  Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.once('ready-to-show', () => {
      win.maximize();
      win.show();
    });
    return;
  }

  const splashPath = path.join(__dirname, 'splash.html');
  if (fs.existsSync(splashPath)) {
    win.loadFile(splashPath);
    win.once('ready-to-show', () => {
      win.maximize();
      win.show();
    });
  }

  const started = startBackend();
  if (!started) {
    const ok = loadFrontend(win);
    if (ok) win.show();
    return;
  }

  const { port, logFile } = started;

  try {
    await waitForPort('127.0.0.1', Number(port), 40000, 400);
  } catch {
    dialog.showErrorBox('Không thể khởi động API', `Backend chưa sẵn sàng sau 40s.\nXem log:\n${logFile}`);
  }

  const ok = loadFrontend(win);
  if (ok) win.show();
}

app.setName('Quản Lý Bán Hàng');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.qlbh.app');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});
app.on('before-quit', stopBackend);