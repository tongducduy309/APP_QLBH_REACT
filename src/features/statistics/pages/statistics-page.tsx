import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, DatePicker, Empty, Select, Spin, Table, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getStatisticsSummary } from "@/services/analysis-api";
import type {
  RevenueBucketRes,
  SalesAnalysisResponse,
  StatisticsMode,
} from "@/features/statistics/types/statistics.types";

const { RangePicker } = DatePicker;

const modeOptions: { label: string; value: StatisticsMode }[] = [
  { label: "Theo ngày", value: "date" },
  { label: "Theo tuần", value: "weekly" },
  { label: "Theo tháng", value: "monthly" },
  { label: "Theo quý", value: "quarterly" },
  { label: "Theo năm", value: "yearly" },
];

function formatPeriodLabel(value?: string) {
  if (!value) return "-";
  const d = dayjs(value);
  if (!d.isValid()) return value;
  return d.format("DD/MM/YYYY");
}

function normalizeChartData(buckets: RevenueBucketRes[]) {
  return buckets.map((item) => ({
    ...item,
    label: formatPeriodLabel(item.periodStart),
    revenue: Number(item.totalRevenue ?? 0),
    orders: Number(item.totalOrders ?? 0),
  }));
}

export function StatisticsPage() {
  const [mode, setMode] = useState<StatisticsMode>("weekly");
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesAnalysisResponse | null>(null);

  const fetchStatistics = async (
    nextMode: StatisticsMode = mode,
    nextRange: [Dayjs, Dayjs] = range
  ) => {
    try {
      setLoading(true);
      const res = await getStatisticsSummary(
        nextMode,
        nextRange[0].format("YYYY-MM-DD"),
        nextRange[1].format("YYYY-MM-DD")
      );
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const chartData = useMemo(
    () => normalizeChartData(data?.buckets ?? []),
    [data]
  );

  const summary = data?.analysisRes;

  const tableColumns = [
    {
      title: "Mốc thời gian",
      dataIndex: "periodStart",
      key: "periodStart",
      render: (value: string) => formatPeriodLabel(value),
    },
    {
      title: "Số đơn",
      dataIndex: "totalOrders",
      key: "totalOrders",
      render: (value: number) => <Tag color="blue">{value ?? 0}</Tag>,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right" as const,
      render: (value: number) => formatCurrency(Number(value ?? 0)),
    },
  ];

  return (
    <PageShell
      // title="Thống kê"
      // description="Theo dõi doanh thu, lợi nhuận, công nợ và biến động bán hàng theo thời gian"
    >
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Bộ lọc thống kê</CardTitle>
            <CardDescription>
              Chọn kiểu thống kê và khoảng thời gian cần xem
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              

              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium">Khoảng thời gian</p>
                <RangePicker
                  className="w-full"
                  value={range}
                  format="DD/MM/YYYY"
                  onChange={(values) => {
                    if (values?.[0] && values?.[1]) {
                      setRange([values[0], values[1]]);
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="primary"
                onClick={() => fetchStatistics()}
                loading={loading}
              >
                Xem thống kê
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
  <Card className="border-0 shadow-sm bg-blue-50">
    <CardHeader className="pb-2">
      <CardDescription className="text-blue-600">Tổng đơn hàng</CardDescription>
      <CardTitle className="text-2xl text-blue-700">
        {summary?.totalOrders ?? 0}
      </CardTitle>
    </CardHeader>
  </Card>

  <Card className="border-0 shadow-sm bg-green-50">
    <CardHeader className="pb-2">
      <CardDescription className="text-green-600">Tổng doanh thu</CardDescription>
      <CardTitle className="text-2xl text-green-700">
        {formatCurrency(Number(summary?.totalRevenue ?? 0))}
      </CardTitle>
    </CardHeader>
  </Card>

  <Card className="border-0 shadow-sm bg-emerald-50">
    <CardHeader className="pb-2">
      <CardDescription className="text-emerald-600">Lợi nhuận gộp</CardDescription>
      <CardTitle className="text-2xl text-emerald-700">
        {formatCurrency(Number(summary?.totalGrossProfit ?? 0))}
      </CardTitle>
    </CardHeader>
  </Card>

  <Card className="border-0 shadow-sm bg-cyan-50">
    <CardHeader className="pb-2">
      <CardDescription className="text-cyan-600">Đã thu</CardDescription>
      <CardTitle className="text-2xl text-cyan-700">
        {formatCurrency(Number(summary?.totalAmountPaid ?? 0))}
      </CardTitle>
    </CardHeader>
  </Card>

  <Card className="border-0 shadow-sm bg-red-50">
    <CardHeader className="pb-2">
      <CardDescription className="text-red-600">Còn nợ</CardDescription>
      <CardTitle className="text-2xl text-red-700">
        {formatCurrency(Number(summary?.totalDebt ?? 0))}
      </CardTitle>
    </CardHeader>
  </Card>

  <Card className="border-0 shadow-sm bg-orange-50">
    <CardHeader className="pb-2">
      <CardDescription className="text-orange-600">Phí vận chuyển</CardDescription>
      <CardTitle className="text-2xl text-orange-700">
        {formatCurrency(Number(summary?.totalShippingFee ?? 0))}
      </CardTitle>
    </CardHeader>
  </Card>
</div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>
              Doanh thu theo từng mốc thời gian trong khoảng đã chọn
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Spin />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center">
                <Empty description="Không có dữ liệu thống kê" />
              </div>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                    <Tooltip
                      // formatter={(value: number) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Thời gian: ${label}`}
                      
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      strokeWidth={2}
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Bảng chi tiết</CardTitle>
            <CardDescription>
              Chi tiết số đơn và doanh thu theo từng bucket
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table
              rowKey={(record) => `${record.periodStart}-${record.totalOrders}`}
              columns={tableColumns}
              dataSource={data?.buckets ?? []}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 700 }}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}