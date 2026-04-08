import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDashboard } from "../hooks/useDashboard";
import type { OrderRecentRes } from "@/types/order";
import { useNavigate } from "react-router-dom";

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

export function DashboardPage() {
  const dashboard = useDashboard();
  const navigate = useNavigate();

  const summary = dashboard.summary;

  const dashboardStats = [
    {
      label: "Tổng đơn hàng",
      value: summary?.totalOrders ?? 0,
      cardClassName: "bg-blue-50 border-blue-100",
      descClassName: "text-blue-600",
      valueClassName: "text-blue-700",
    },
    {
      label: "Tổng doanh thu",
      value: formatCurrency(Number(summary?.totalRevenue ?? 0)),
      cardClassName: "bg-green-50 border-green-100",
      descClassName: "text-green-600",
      valueClassName: "text-green-700",
    },
    {
      label: "Lợi nhuận gộp",
      value: formatCurrency(Number(summary?.totalGrossProfit ?? 0)),
      cardClassName: "bg-emerald-50 border-emerald-100",
      descClassName: "text-emerald-600",
      valueClassName: "text-emerald-700",
    },
    {
      label: "Còn nợ",
      value: formatCurrency(Number(summary?.totalDebt ?? 0)),
      cardClassName: "bg-red-50 border-red-100",
      descClassName: "text-red-600",
      valueClassName: "text-red-700",
    },
  ];

  return (
    <PageShell
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((item) => (
            <Card
              key={item.label}
              className={`border shadow-sm ${item.cardClassName}`}
            >
              <CardHeader>
                <CardDescription className={item.descClassName}>
                  {item.label}
                </CardDescription>
                <CardTitle className={item.valueClassName}>
                  {dashboard.isLoading ? "..." : item.value}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Xu hướng doanh thu 24h</CardTitle>
              <CardDescription>Biểu đồ doanh thu tổng hợp theo ngày</CardDescription>
            </CardHeader>

            <CardContent className="h-[320px]">
              {dashboard.isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </div>
              ) : dashboard.revenueTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Chưa có dữ liệu doanh thu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard.revenueTrend}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#007bff" name="Doanh thu"/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>5 hóa đơn mới nhất</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {dashboard.isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải giao dịch...</div>
              ) : dashboard.recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  Chưa có giao dịch gần đây
                </div>
              ) : (
                dashboard.recentOrders.map((item: OrderRecentRes) => (
                  <div
                    key={item.id}
                    className="cursor-pointer rounded-2xl border p-4 transition hover:bg-muted/40"
                    onClick={() => navigate(`/transactions/${item.id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">{item.code}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.customerName || "Khách lẻ"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(Number(item.total ?? 0))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}