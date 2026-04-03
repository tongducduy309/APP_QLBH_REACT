import { Table } from "antd";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatCurrency } from "@/lib/utils";

export function QuoteReportPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Bảng báo giá</CardTitle>
            <CardDescription>Xuất danh sách sản phẩm và giá bán hiện tại</CardDescription>
          </div>
          <Button>Xuất báo giá</Button>
        </CardHeader>
        <CardContent>
          <Table
            rowKey="id"
            // dataSource={products}
            columns={[
              { title: "Sản phẩm", dataIndex: "name" },
              { title: "Danh mục", dataIndex: "category" },
              { title: "Giá", dataIndex: "price", render: (value: number) => formatCurrency(value) },
            ]}
            pagination={false}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
