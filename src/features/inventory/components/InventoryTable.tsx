import { useMemo, useState } from "react";
import { Input, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Package2, Pencil, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { paths } from "@/routes/paths";
import { formatCurrency } from "@/lib/utils";
import type {
  ProductInventoryRes,
  ProductVariantInventoryRes,
} from "../types/inventory.types";
import { removeVietnameseTones } from "@/utils/string";

type Props = {
  items: ProductInventoryRes[];
  onCreate: () => void;
  onEditProduct: (product: ProductInventoryRes) => void;
  onEditInventory: (
    parentProductId: number,
    variant: ProductVariantInventoryRes
  ) => void;
  onImportStock: (
    parentProductId: number,
    variant: ProductVariantInventoryRes,
    productName: string
  ) => void;
};

export function InventoryTable({
  items,
  onCreate,
  onEditProduct,
  onEditInventory,
  onImportStock,
}: Props) {
  const [search, setSearch] = useState("");
  const [manualExpandedKeys, setManualExpandedKeys] = useState<React.Key[]>([]);

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones(search),
    [search]
  );

  const filteredItems = useMemo(() => {
    if (!normalizedKeyword) return items;

    return items.filter((item) => {
      const name = removeVietnameseTones(item.name || "");
      const category = removeVietnameseTones(item.categoryName || "");

      const matchProduct =
        name.includes(normalizedKeyword) ||
        category.includes(normalizedKeyword);

      const matchVariant = (item.variants ?? []).some((variant) => {
        const variantCode = removeVietnameseTones(variant.variantCode || "");
        const lotCode = removeVietnameseTones(variant.lotCode || "");
        const sku = removeVietnameseTones(variant.sku || "");

        return (
          variantCode.includes(normalizedKeyword) ||
          lotCode.includes(normalizedKeyword) ||
          sku.includes(normalizedKeyword)
        );
      });

      return matchProduct || matchVariant;
    });
  }, [items, normalizedKeyword]);

  const autoExpandedKeys = useMemo(() => {
    if (!normalizedKeyword) return [];

    return filteredItems
      .filter((item) =>
        (item.variants ?? []).some((variant) => {
          const variantCode = removeVietnameseTones(variant.variantCode || "");
          const lotCode = removeVietnameseTones(variant.lotCode || "");
          const sku = removeVietnameseTones(variant.sku || "");

          return (
            variantCode.includes(normalizedKeyword) ||
            lotCode.includes(normalizedKeyword) ||
            sku.includes(normalizedKeyword)
          );
        })
      )
      .map((item) => item.id);
  }, [filteredItems, normalizedKeyword]);

  const expandedRowKeys = useMemo(() => {
    if (normalizedKeyword) return autoExpandedKeys;
    return manualExpandedKeys;
  }, [normalizedKeyword, autoExpandedKeys, manualExpandedKeys]);

  const columns: ColumnsType<ProductInventoryRes> = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (_, record) => {
        const detailPath = paths.productDetail.replace(
          ":id",
          String(record.id)
        );

        return (
          <div>
            <Link
              to={detailPath}
              className="font-medium text-primary hover:underline"
            >
              {record.name}
            </Link>

            <p className="text-xs text-muted-foreground">
              {record.baseUnit || "mét"}
            </p>
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 140,
      render: (value: string) => value || "-",
    },
    {
      title: "Biến thể",
      key: "variantCount",
      width: 100,
      render: (_, record) => record.variants?.length ?? 0,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 130,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Đang bán" : "Ngừng bán"}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 120,
      render: (value: string) => {
        if (!value) return "-";

        return (
          <Tooltip title={value}>
            <div
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                lineHeight: "1.4em",
                maxHeight: "2.8em",
              }}
            >
              {value}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        const detailPath = paths.productDetail.replace(
          ":id",
          String(record.id)
        );

        return (
          <div className="flex gap-2">
            <Link to={detailPath} className="!font-medium !text-primary">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Chi tiết
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditProduct(record)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Sửa
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Danh sách hàng hóa</CardTitle>
          <CardDescription>
            Hiển thị sản phẩm cha và bung ra danh sách biến thể
          </CardDescription>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Input
            placeholder="Tìm theo tên, danh mục, SKU, mã lô, loại biến thể..."
            prefix={<Search className="h-4 w-4" />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[360px]"
          />
          <Button onClick={onCreate}>Thêm sản phẩm</Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table<ProductInventoryRes>
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          pagination={{ pageSize: 6 }}
          locale={{
            emptyText: search
              ? "Không tìm thấy sản phẩm phù hợp."
              : "Chưa có dữ liệu hàng hóa.",
          }}
          scroll={{ x: 1100 }}
          onRow={(record) => ({
            onClick: () => {
              const key = record.id;

              if (normalizedKeyword) return;

              setManualExpandedKeys((prev) => {
                const exists = prev.includes(key);
                if (exists) {
                  return prev.filter((k) => k !== key);
                }
                return [...prev, key];
              });
            },
          })}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys: any) => {
              if (!normalizedKeyword) {
                setManualExpandedKeys(keys);
              }
            },
            expandedRowRender: (record) => {
              const variantColumns: ColumnsType<ProductVariantInventoryRes> = [
                {
                  title: "Mã SKU",
                  dataIndex: "sku",
                  key: "sku",
                  width: 110,
                  render: (value) => value ?? "-",
                },
                {
                  title: "Mã kho",
                  dataIndex: "lotCode",
                  key: "lotCode",
                  width: 140,
                  render: (value) => value || "-",
                },
                {
                  title: "Loại",
                  dataIndex: "variantCode",
                  key: "variantCode",
                  width: 140,
                  render: (_, variant) => {
                    if (!variant.variantCode) return "-";
                    if (variant.weight) {
                      return (
                        <Tooltip
                          title={
                            <div className="space-y-1 text-sm">
                              <div>Loại: {variant.variantCode}</div>
                              <div>Trọng lượng: {variant.weight}</div>
                            </div>
                          }
                        >
                          {variant.variantCode} {`(${variant.weight})`}
                        </Tooltip>
                      );
                    }
                    return variant.variantCode;
                  },
                },
                {
                  title: "Giá bán lẻ / Giá cửa hàng",
                  dataIndex: "retailPrice_storePrice",
                  key: "retailPrice_storePrice",
                  width: 150,
                  render: (_: number, variant: ProductVariantInventoryRes) =>
                    formatCurrency(Number(variant.retailPrice ?? 0)) +
                    " / " +
                    formatCurrency(Number(variant.storePrice ?? 0)),
                },
                {
                  title: "Giá vốn",
                  dataIndex: "costPrice",
                  key: "costPrice",
                  width: 150,
                  render: (value: number) =>
                    formatCurrency(Number(value ?? 0)),
                },
                {
                  title: "Tồn kho",
                  dataIndex: "remainingQty",
                  key: "remainingQty",
                  width: 100,
                  render: (value: number) => {
                    const qty = Number(value ?? 0);
                    if (qty <= 0) return <Tag color="red">{qty}</Tag>;
                    if (qty <= 10) return <Tag color="orange">{qty}</Tag>;
                    return <Tag color="green">{qty}</Tag>;
                  },
                },
                {
                  title: "Trạng thái",
                  dataIndex: "active",
                  key: "active",
                  width: 100,
                  render: (active: boolean) => (
                    <Tag color={active ? "green" : "red"}>
                      {active ? "Hoạt động" : "Ngưng"}
                    </Tag>
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 260,
                  render: (_, variant) => (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onImportStock(record.id ?? 0, variant, record.name)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Nhập hàng
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditInventory(record.id ?? 0, variant)}
                      >
                        <Package2 className="mr-2 h-4 w-4" />
                        Chỉnh tồn kho
                      </Button>
                    </div>
                  ),
                },
              ];

              const filteredVariants =
                normalizedKeyword.length === 0
                  ? record.variants ?? []
                  : (record.variants ?? []).filter((variant) => {
                    const variantCode = removeVietnameseTones(
                      variant.variantCode || ""
                    );
                    const sku = removeVietnameseTones(variant.sku || "");
                    const lotCode = removeVietnameseTones(
                      variant.lotCode || ""
                    );

                    return (
                      variantCode.includes(normalizedKeyword) ||
                      sku.includes(normalizedKeyword) ||
                      lotCode.includes(normalizedKeyword)
                    );
                  });

              return (
                <div className="px-2 py-1">
                  <Table<ProductVariantInventoryRes>
                    rowKey={(variant) =>
                      variant.inventoryId?.toString() ??
                      `${record.id}-${variant.variantId}-${variant.lotCode}-${variant.sku}`
                    }
                    columns={variantColumns}
                    dataSource={filteredVariants}
                    pagination={false}
                    size="small"
                    locale={{
                      emptyText: "Không có biến thể phù hợp.",
                    }}
                    scroll={{ x: 1300 }}
                  />
                </div>
              );
            },
            rowExpandable: (record) => (record.variants?.length ?? 0) > 0,
          }}
        />
      </CardContent>
    </Card>
  );
}