// src/modules/sales/components/ProductSelectorCard.tsx

import { useMemo, useState } from "react";
import { Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "../types/sales.types";
import { removeVietnameseTones } from "@/utils/string";

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
  const [search, setSearch] = useState("");

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones(search),
    [search]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

    // filter theo tab (status)
    if (tab !== "Tất cả") {
      result = result.filter((item) => item.status === tab);
    }

    // search không dấu
    if (normalizedKeyword) {
      result = result.filter((item) => {
        const name = removeVietnameseTones(item.name || "");
        const sku = removeVietnameseTones(item.sku || "");
        const category = removeVietnameseTones(item.category || "");
        const variantCode = removeVietnameseTones(item.variantCode || "");

        return (
          name.includes(normalizedKeyword) ||
          sku.includes(normalizedKeyword) ||
          category.includes(normalizedKeyword) ||
          variantCode.includes(normalizedKeyword)
        );
      });
    }

    return result;
  }, [products, tab, normalizedKeyword]);

  const productColumns: ColumnsType<Product> = [
    { title: "Mã", dataIndex: "sku", key: "sku", width: 110 },

    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (value: string, record: Product) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {value} ({record.variantCode})
          </span>
        </div>
      ),
    },

    { title: "Danh mục", dataIndex: "category", key: "category", width: 140 },

    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: 100,
    },

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
          status === "Còn hàng"
            ? "green"
            : status === "Sắp hết"
            ? "orange"
            : "red";

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
          // disabled={record.status === "Hết hàng"}
        >
          Đặt hàng
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Quầy bán hàng</CardTitle>
          <CardDescription>
            Chọn sản phẩm hoặc thêm chi phí khác để đưa vào đơn hàng
          </CardDescription>
        </div>

        {/* SEARCH */}
        <div>
          <Input
          placeholder="Tìm theo tên, SKU, loại..."
          prefix={<Search className="h-4 w-4" />}
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[50px] "
        />
        </div>
      </CardHeader>

      <CardContent>
        <Table<Product>
          rowKey={(record) => `${record.id}-${record.variantId}`}
          columns={productColumns}
          dataSource={filteredProducts}
          pagination={{ pageSize: 5 }}
          locale={{
            emptyText: search
              ? "Không tìm thấy sản phẩm"
              : "Chưa có sản phẩm",
          }}
          scroll={{ x: 980 }}
        />
      </CardContent>
    </Card>
  );
}