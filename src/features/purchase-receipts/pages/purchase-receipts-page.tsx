import { Table } from "antd";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const receipts = [
  { id: "PN001", supplier: "Công ty Tin học A", total: 12000000, date: "2026-03-29", status: "Đã nhập" },
  { id: "PN002", supplier: "Công ty Phụ kiện B", total: 4500000, date: "2026-03-30", status: "Chờ duyệt" },
];

export function PurchaseReceiptsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Phiếu nhập</CardTitle>
            <CardDescription>Quản lý nhập kho theo nhà cung cấp</CardDescription>
          </div>
          <Button>Tạo phiếu nhập</Button>
        </CardHeader>
        <CardContent>
          <Table
            rowKey="id"
            dataSource={receipts}
            columns={[
              { title: "Mã phiếu", dataIndex: "id" },
              { title: "Nhà cung cấp", dataIndex: "supplier" },
              { title: "Ngày nhập", dataIndex: "date" },
              { title: "Tổng tiền", dataIndex: "total", render: (value: number) => formatCurrency(value) },
              { title: "Trạng thái", dataIndex: "status" },
            ]}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
