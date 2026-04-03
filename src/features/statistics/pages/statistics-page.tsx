import { ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { revenueTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function StatisticsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
          <CardDescription>Biểu đồ doanh thu theo tuần</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageShell>
  );
}
