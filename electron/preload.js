const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  apiBaseUrl: 'http://127.0.0.1:18080',
  printPdfSilent: (payload) => ipcRenderer.invoke('print:pdf:silent', payload)
});