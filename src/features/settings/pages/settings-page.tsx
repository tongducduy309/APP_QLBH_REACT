import { Button, Input, InputNumber, Select, Switch, message } from "antd";
import { Save, RotateCcw, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { defaultSettings, useSettingsStore } from "../store/settings-store";
import type { UserSettings } from "../types/settings.types";

const paperSizeOptions = [
  { label: "A4", value: "A4" },
  { label: "A5", value: "A5" },
  { label: "Letter", value: "LETTER" },
];

const pageOrientationOptions = [
  { label: "Dọc", value: "portrait" },
  { label: "Ngang", value: "landscape" },
];

export function SettingsPage() {
  const { settings, saveSettings, loading } = useSettingsStore();
  const [form, setForm] = useState<UserSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);


  async function handleSave() {
    try {
      await saveSettings({
        ...form,
        printOptions: {
          paperSize: form.printOptions?.paperSize || "A4",
          copies: form.printOptions?.copies || 1,
          pageOrientation: form.printOptions?.pageOrientation || "portrait",
          deviceName: form.printOptions?.deviceName?.trim() || "",
        },
      });

      message.success("Lưu cài đặt thành công");
    } catch (error) {
      message.warning("Đã lưu tạm cài đặt ở local, nhưng chưa đồng bộ được server");
    }
  }

  function handleReset() {
    setForm(defaultSettings);
  }

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt ứng dụng</CardTitle>
            <CardDescription>
              Tùy chỉnh tên app, thông báo và thiết lập in PDF cho tài khoản hiện tại
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            <div className="rounded-2xl border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Cài đặt xuất / in PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Áp dụng cho quotation và hóa đơn khi in hoặc export PDF
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Khổ giấy</label>
                  <Select
                    size="large"
                    className="w-full"
                    value={form.printOptions?.paperSize || "A4"}
                    options={paperSizeOptions}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        printOptions: {
                          ...prev.printOptions,
                          paperSize: value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hướng giấy</label>
                  <Select
                    size="large"
                    className="w-full"
                    value={form.printOptions?.pageOrientation || "portrait"}
                    options={pageOrientationOptions}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        printOptions: {
                          ...prev.printOptions,
                          pageOrientation: value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-medium">Số bản in</label>
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={1}
                    max={20}
                    value={form.printOptions?.copies || 1}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        printOptions: {
                          ...prev.printOptions,
                          copies: Number(value || 1),
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên máy in</label>
                  <Input
                    size="large"
                    value={form.printOptions?.deviceName || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        printOptions: {
                          ...prev.printOptions,
                          deviceName: e.target.value,
                        },
                      }))
                    }
                    placeholder="Ví dụ: Microsoft Print to PDF"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Xem trước cấu hình</p>
                <p>Khổ giấy: {form.printOptions?.paperSize || "A4"}</p>
                <p>
                  Hướng giấy:{" "}
                  {form.printOptions?.pageOrientation === "landscape" ? "Ngang" : "Dọc"}
                </p>
                <p>Số bản in: {form.printOptions?.copies || 1}</p>
                <p>Máy in: {form.printOptions?.deviceName?.trim() || "Chưa chọn"}</p>
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
              Mô phỏng phần tên ứng dụng và cấu hình in PDF hiện tại
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-background p-4">
              <p className="mb-2 text-sm font-medium">Cấu hình PDF / Print</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Khổ giấy: {form.printOptions?.paperSize || "A4"}</li>
                <li>
                  Hướng giấy:{" "}
                  {form.printOptions?.pageOrientation === "landscape" ? "Ngang" : "Dọc"}
                </li>
                <li>Số bản in: {form.printOptions?.copies || 1}</li>
                <li>Máy in: {form.printOptions?.deviceName?.trim() || "Chưa chọn"}</li>
              </ul>
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <p className="mb-2 text-sm font-medium">Gợi ý</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Nên dùng A4 cho hóa đơn và quotation.</li>
                <li>Chọn dọc nếu mẫu PDF của bạn bố cục dạng chuẩn.</li>
                <li>Chọn ngang nếu bảng sản phẩm có nhiều cột.</li>
                <li>Thiết bị in có thể để trống nếu không cố định máy in.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}