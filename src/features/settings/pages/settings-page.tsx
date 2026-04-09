import { Button, Input, Switch, Upload, message } from "antd";
import type { UploadProps } from "antd";
import { Image as ImageIcon, Save, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettingsStore } from "../store/settings-store";
import type { UserSettings } from "../types/settings.types";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
  });
}

export function SettingsPage() {
  const { settings, saveSettings, loading } = useSettingsStore();

  const [form, setForm] = useState<UserSettings>(settings);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const previewTitle = useMemo(
    () => form.appName?.trim() || "Quản lý bán hàng",
    [form.appName]
  );

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        setUploading(true);
        const base64 = await fileToBase64(file);
        setForm((prev) => ({
          ...prev,
          appIcon: base64,
        }));
      } catch {
        message.error("Không thể đọc file ảnh");
      } finally {
        setUploading(false);
      }

      return false;
    },
  };

  async function handleSave() {
    try {
      await saveSettings({
        ...form,
        appName: form.appName.trim() || "Quản lý bán hàng",
      });

      message.success("Lưu cài đặt thành công");
    } catch (error) {
      message.warning("Đã lưu tạm cài đặt ở local, nhưng chưa đồng bộ được server");
    }
  }

  function handleReset() {
    setForm({
      appName: "Quản lý bán hàng",
      appIcon: null,
      emailNotify: true,
      desktopNotify: false,
    });
  }

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt ứng dụng</CardTitle>
            <CardDescription>
              Tùy chỉnh tên app, icon app và thông báo cho tài khoản hiện tại
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên ứng dụng</label>
                <Input
                  size="large"
                  value={form.appName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      appName: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên ứng dụng"
                />
                <p className="text-xs text-muted-foreground">
                  Tên này sẽ hiển thị ở header và sidebar.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon ứng dụng</label>

                <div className="flex items-center gap-3">
                  <Upload {...uploadProps}>
                    <Button size="large" loading={uploading}>
                      Chọn ảnh
                    </Button>
                  </Upload>

                  {form.appIcon ? (
                    <Button
                      size="large"
                      danger
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          appIcon: null,
                        }))
                      }
                    >
                      Xóa icon
                    </Button>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">
                  Nên dùng ảnh vuông PNG/JPG để hiển thị đẹp hơn.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="font-medium">Thông báo email</p>
                  <p className="text-sm text-muted-foreground">
                    Gửi email khi phát sinh hóa đơn mới
                  </p>
                </div>
                <Switch
                  checked={form.emailNotify}
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      emailNotify: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="font-medium">Thông báo desktop</p>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị thông báo nổi khi có giao dịch mới
                  </p>
                </div>
                <Switch disabled
                  checked={form.desktopNotify}
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      desktopNotify: checked,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="primary" size="large" onClick={handleSave} loading={loading}>
                <Save className="mr-2 h-4 w-4" />
                Lưu cài đặt
              </Button>

              <Button size="large" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Đặt lại mặc định
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xem trước</CardTitle>
            <CardDescription>
              Mô phỏng phần app name và app icon sẽ hiển thị trên giao diện
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 rounded-3xl border bg-muted/20 p-5">
              <div className="flex items-center gap-4 rounded-2xl border bg-background p-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
                  {form.appIcon ? (
                    <img
                      src={form.appIcon}
                      alt={previewTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Header / Sidebar</p>
                  <p className="truncate text-lg font-semibold">{previewTitle}</p>
                  <p className="text-sm text-muted-foreground">Hệ thống quản lý</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <p className="mb-2 text-sm font-medium">Gợi ý</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Tên app nên ngắn gọn để không bị tràn trên header.</li>
                  <li>Icon vuông sẽ hiển thị đẹp hơn ở sidebar.</li>
                  <li>Nếu backend lỗi, dữ liệu vẫn được giữ tạm ở localStorage.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}