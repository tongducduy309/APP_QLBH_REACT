import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { dashboardStats, revenueTrend } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDashboard } from "../hooks/useDashboard";
import { OrderRecentRes } from "@/types/order";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const dashboard = useDashboard();
  const navigate = useNavigate();
  return (
    <PageShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng doanh thu 7 ngày</CardTitle>
            <CardDescription>Biểu đồ doanh thu tổng hợp theo ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>3 hóa đơn mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentOrders.map((item:OrderRecentRes) => (
              <div key={item.id} className="rounded-2xl border p-4 cursor-pointer" onClick={() => navigate(`/transactions/${item.id}`)}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.code}</p>
                    <p className="text-sm text-muted-foreground">{item.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.total)}</p>
                    <p className="text-sm text-muted-foreground">{item.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
