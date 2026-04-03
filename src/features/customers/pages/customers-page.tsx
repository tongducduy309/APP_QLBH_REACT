import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { customers, type Customer } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnsType<Customer> = [
  { title: "Tên khách hàng", dataIndex: "name", key: "name" },
  { title: "Điện thoại", dataIndex: "phone", key: "phone" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Hạng", dataIndex: "tier", key: "tier", render: (tier) => <Tag color="blue">{tier}</Tag> },
  { title: "Công nợ", dataIndex: "debt", key: "debt", render: (value: number) => formatCurrency(value) },
];

export function CustomersPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý khách hàng</CardTitle>
          <CardDescription>Danh sách khách hàng và công nợ hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          <Table<Customer> rowKey="id" columns={columns} dataSource={customers} pagination={{ pageSize: 5 }} scroll={{ x: 800 }} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
