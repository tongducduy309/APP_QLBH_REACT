import { ScanLine } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BarcodePage() {
  return (
    <PageShell>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Quét mã vạch</CardTitle>
          <CardDescription>Khung sẵn sàng để tích hợp scanner thật hoặc camera scanning library.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-dashed p-10 text-center">
            <ScanLine className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Khu vực preview thiết bị scan</p>
          </div>
          <Input placeholder="Nhập mã vạch thủ công" />
          <Button>Bắt đầu quét</Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
