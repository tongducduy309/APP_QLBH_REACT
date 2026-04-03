import { Switch } from "antd";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  const [emailNotify, setEmailNotify] = useState(true);
  const [desktopNotify, setDesktopNotify] = useState(false);

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt hệ thống</CardTitle>
            <CardDescription>Tùy chỉnh các hành vi cơ bản của ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Thông báo email</p>
                <p className="text-sm text-muted-foreground">Gửi email khi phát sinh hóa đơn mới</p>
              </div>
              <Switch checked={emailNotify} onChange={setEmailNotify} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-medium">Thông báo desktop</p>
                <p className="text-sm text-muted-foreground">Hiển thị thông báo nổi khi có giao dịch mới</p>
              </div>
              <Switch checked={desktopNotify} onChange={setDesktopNotify} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin migrate</CardTitle>
            <CardDescription>Những phần đã chuẩn bị để nối backend thật</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>- Axios instance chung với interceptor token.</p>
            <p>- Auth state bằng Zustand.</p>
            <p>- Route guard đã tách riêng.</p>
            <p>- Có thể thay mock data bằng API trong từng feature.</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
