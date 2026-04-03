// src/modules/sales/components/ProductSelectorCard.tsx

import { Segmented, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "../types/sales.types";

type Props = {
  tab: string;
  onTabChange: (value: string) => void;
  products: Product[];
  onOrderProduct: (product: Product) => void;
};

export function ProductSelectorCard({
  tab,
  onTabChange,
  products,
  onOrderProduct,
}: Props) {
  const productColumns: ColumnsType<Product> = [
    { title: "Mã", dataIndex: "sku", key: "sku", width: 110 },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", width: 220 },
    { title: "Danh mục", dataIndex: "category", key: "category", width: 140 },
    { title: "Tồn kho", dataIndex: "stock", key: "stock", width: 100 },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 140,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: Product["status"]) => {
        const color =
          status === "Còn hàng" ? "green" : status === "Sắp hết" ? "orange" : "red";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Button
          size="sm"
          onClick={() => onOrderProduct(record)}
          disabled={record.status === "Hết hàng"}
        >
          Đặt hàng
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 ">
        <div>
          <CardTitle>Quầy bán hàng</CardTitle>
          <CardDescription>
            Chọn sản phẩm hoặc thêm chi phí khác để đưa vào đơn hàng
          </CardDescription>
        </div>

        <Segmented
          options={["Tất cả", "Còn hàng", "Sắp hết", "Hết hàng"]}
          value={tab}
          onChange={(value) => onTabChange(String(value))}
        />
      </CardHeader>

      <CardContent>
        <Table<Product>
          rowKey="id"
          columns={productColumns}
          dataSource={products}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 980 }}
        />
      </CardContent>
    </Card>
  );
}