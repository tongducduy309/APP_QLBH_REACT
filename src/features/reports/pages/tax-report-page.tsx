import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TaxReportPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo thuế</CardTitle>
          <CardDescription>Trang này được dựng để map từ module `bao-cao-thue` của Angular sang React.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>- Tổng doanh thu chịu thuế: 525.000.000đ</p>
          <p>- Thuế GTGT đầu ra: 52.500.000đ</p>
          <p>- Thuế GTGT đầu vào được khấu trừ: 21.000.000đ</p>
          <p>- Số thuế tạm tính phải nộp: 31.500.000đ</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
