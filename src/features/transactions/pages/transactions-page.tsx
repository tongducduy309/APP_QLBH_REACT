import { DatePicker, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transactions, type Transaction } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnsType<Transaction> = [
  { title: "Mã giao dịch", dataIndex: "id", key: "id" },
  { title: "Khách hàng", dataIndex: "customer", key: "customer" },
  { title: "Kênh", dataIndex: "channel", key: "channel" },
  { title: "Thời gian", dataIndex: "createdAt", key: "createdAt" },
  { title: "Tổng tiền", dataIndex: "total", key: "total", render: (value: number) => formatCurrency(value) },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: Transaction["status"]) => <Tag color={status === "Hoàn thành" ? "green" : status === "Chờ xử lý" ? "orange" : "red"}>{status}</Tag>,
  },
];

export function TransactionsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>Lọc hóa đơn theo thời gian và trạng thái</CardDescription>
          </div>
          <Space>
            <DatePicker.RangePicker />
          </Space>
        </CardHeader>
        <CardContent>
          <Table<Transaction> rowKey="id" columns={columns} dataSource={transactions} pagination={{ pageSize: 6 }} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
