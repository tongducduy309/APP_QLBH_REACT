import { useEffect, useMemo, useState } from "react";
import {
  Checkbox,
  Input,
  InputNumber,
  Radio,
  Select,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Download, Printer, Search } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatCurrency } from "@/lib/utils";
import { removeVietnameseTones } from "@/utils/string";
import type { ProductInventoryRes } from "@/features/inventory/types/inventory.types";
import { getAllInventory } from "@/services/product-api";
import { NumberInput } from "@/components/ui/number-input";

type PriceMode = "retail" | "store";

type QuoteRow = {
  key: string;
  productId: number;
  productName: string;
  categoryName: string;
  baseUnit: string;
  description: string;
  productActive: boolean;

  inventoryId: number | null;
  variantId: number | null;
  sku: string;
  lotCode: string;
  variantCode: string;
  weight: number;
  retailPrice: number;
  storePrice: number;
  remainingQty: number;
  costPrice: number;
  active: boolean;
};

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    message.warning("Không có dữ liệu để xuất");
    return;
  }

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (value: unknown) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function mapProductsToQuoteRows(items: ProductInventoryRes[]): QuoteRow[] {
  return items.flatMap((product) =>
    (product.variants ?? []).map((variant) => ({
      key: `${product.id}-${variant.inventoryId ?? variant.variantId ?? variant.sku}`,
      productId: product.id,
      productName: product.name,
      categoryName: product.categoryName,
      baseUnit: product.baseUnit,
      description: product.description,
      productActive: product.active,

      inventoryId: variant.inventoryId,
      variantId: variant.variantId,
      sku: variant.sku,
      lotCode: variant.lotCode,
      variantCode: variant.variantCode,
      weight: Number(variant.weight ?? 0),
      retailPrice: Number(variant.retailPrice ?? 0),
      storePrice: Number(variant.storePrice ?? 0),
      remainingQty: Number(variant.remainingQty ?? 0),
      costPrice: Number(variant.costPrice ?? 0),
      active: variant.active,
    }))
  );
}

export function QuoteReportPage() {
  const [products, setProducts] = useState<ProductInventoryRes[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceMode, setPriceMode] = useState<PriceMode>("retail");
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getAllInventory();
        setProducts(res ?? []);
      } catch (error) {
        console.error("Lỗi lấy danh sách hàng hóa", error);
        message.error("Không thể tải danh sách hàng hóa");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const allRows = useMemo(() => mapProductsToQuoteRows(products), [products]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((item) => item.categoryName).filter(Boolean))
    );

    return unique.map((item) => ({
      label: item,
      value: item,
    }));
  }, [products]);

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones(keyword.trim().toLowerCase()),
    [keyword]
  );

  const filteredRows = useMemo(() => {
    return allRows.filter((item) => {
      const haystack = removeVietnameseTones(
        [
          item.productName,
          item.categoryName,
          item.baseUnit,
          item.description,
          item.sku,
          item.lotCode,
          item.variantCode,
          String(item.weight ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
      );

      const matchKeyword =
        !normalizedKeyword || haystack.includes(normalizedKeyword);

      const matchCategory =
        category === "all" || item.categoryName === category;

      const matchActive = !onlyActive || (item.productActive && item.active);

      const matchStock = !onlyInStock || item.remainingQty > 0;

      return matchKeyword && matchCategory && matchActive && matchStock;
    });
  }, [allRows, normalizedKeyword, category, onlyActive, onlyInStock]);

  const getDefaultPrice = (row: QuoteRow) =>
    priceMode === "retail"
      ? Number(row.retailPrice ?? 0)
      : Number(row.storePrice ?? 0);

  const getQuotePrice = (row: QuoteRow) => {
    const edited = editedPrices[String(row.key)];
    return edited ?? getDefaultPrice(row);
  };

  const selectedRows = useMemo(() => {
    const selectedSet = new Set(selectedRowKeys.map(String));
    return filteredRows.filter((item) => selectedSet.has(String(item.key)));
  }, [filteredRows, selectedRowKeys]);

  const effectiveRows = useMemo(() => {
    return selectedRowKeys.length > 0 ? selectedRows : filteredRows;
  }, [selectedRowKeys.length, selectedRows, filteredRows]);

  const totalSelected = selectedRowKeys.length;

  const avgSelectedPrice = useMemo(() => {
    if (!effectiveRows.length) return 0;

    const total = effectiveRows.reduce((sum, item) => {
      return sum + getQuotePrice(item);
    }, 0);

    return Math.round(total / effectiveRows.length);
  }, [effectiveRows, editedPrices, priceMode]);

  const exportRows = useMemo(() => {
    return effectiveRows.map((item, index) => {
      const sellingPrice = getQuotePrice(item);

      return {
        STT: index + 1,
        "Tên sản phẩm": item.productName,
        "Danh mục": item.categoryName,
        "SKU": item.sku || "",
        "Mã lô": item.lotCode || "",
        "Loại biến thể": item.variantCode || "",
        "Trọng lượng": item.weight || 0,
        "Đơn vị": item.baseUnit || "",
        "Tồn kho": item.remainingQty ?? 0,
        "Giá gốc":
          priceMode === "retail"
            ? formatCurrency(item.retailPrice ?? 0)
            : formatCurrency(item.storePrice ?? 0),
        "Giá báo": sellingPrice,
        "Giá báo định dạng": formatCurrency(sellingPrice),
        "Mô tả": item.description || "",
      };
    });
  }, [effectiveRows, editedPrices, priceMode]);

  const handleExportCsv = () => {
    downloadCsv("bang-bao-gia.csv", exportRows);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectAllFiltered = () => {
    setSelectedRowKeys(filteredRows.map((item) => item.key));
  };

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleResetEditedPrices = () => {
    setEditedPrices({});
    message.success("Đã đặt lại giá báo về giá mặc định");
  };

  const columns: ColumnsType<QuoteRow> = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      // width: 240,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <div className="text-xs text-muted-foreground">
            {record.categoryName || "-"} · {record.baseUnit || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 140,
      render: (value: string) => value || "-",
    },
    {
      title: "Loại",
      dataIndex: "variantCode",
      key: "variantCode",
      width: 160,
      render: (_, record) => {
        if (!record.variantCode) return "-";
        return record.weight
          ? `${record.variantCode} (${record.weight})`
          : record.variantCode;
      },
    },
    {
      title: priceMode === "retail" ? "Giá gốc lẻ" : "Giá gốc cửa hàng",
      key: "basePrice",
      width: 160,
      align: "right",
      render: (_, record) => (
        <span className="text-muted-foreground">
          {formatCurrency(getDefaultPrice(record))}
        </span>
      ),
    },
    {
      title: "Giá báo",
      key: "quotePrice",
      width: 190,
      render: (_, record) => {
        const rowKey = String(record.key);
        const currentValue = getQuotePrice(record);

        return (
          <div className="flex flex-col gap-1">
            <NumberInput
              min={0}
              value={currentValue}
              onValueChange={(value) => {
                const nextValue = Math.max(0, Number(value ?? 0));
                setEditedPrices((prev) => ({
                  ...prev,
                  [rowKey]: nextValue,
                }));
              }}
              className="w-full"
            />
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => {
        const isActive = record.productActive && record.active;
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Đang bán" : "Ngừng bán"}
          </Tag>
        );
      },
    },
  ];

  return (
    <PageShell>
      <div className="space-y-4 print:space-y-2">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:pb-2">
            <div>
              <CardTitle>Bảng báo giá</CardTitle>
              <CardDescription>
                Chọn các mặt hàng cần đưa vào báo giá từ dữ liệu hàng hóa thực tế
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <Button variant="outline" onClick={handleResetEditedPrices}>
                Đặt lại giá
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                In báo giá
              </Button>
              <Button onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                Xuất CSV
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 print:hidden">
              <Input
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm tên, SKU, mã lô, loại..."
                prefix={<Search className="h-4 w-4" />}
              />

              <Select
                value={category}
                onChange={setCategory}
                options={[
                  { label: "Tất cả danh mục", value: "all" },
                  ...categories,
                ]}
              />

              <Radio.Group
                value={priceMode}
                onChange={(e) => setPriceMode(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="retail">Giá lẻ</Radio.Button>
                <Radio.Button value="store">Giá cửa hàng</Radio.Button>
              </Radio.Group>

              <div className="rounded-md border px-3 py-2 text-sm">
                <div className="text-muted-foreground">Đang hiển thị</div>
                <div className="font-semibold">{filteredRows.length} mặt hàng</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-lg border p-3 print:hidden">
              <Checkbox
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              >
                Chỉ lấy mặt hàng đang bán
              </Checkbox>

              <Checkbox
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
              >
                Chỉ lấy mặt hàng còn tồn
              </Checkbox>

              <Button variant="outline" onClick={handleSelectAllFiltered}>
                Chọn tất cả đang lọc
              </Button>

              <Button variant="outline" onClick={handleClearSelection}>
                Bỏ chọn
              </Button>

              <div className="text-sm text-muted-foreground">
                Đã chọn: <span className="font-semibold">{totalSelected}</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 print:hidden">
              <div className="rounded-md border px-3 py-2 text-sm">
                <div className="text-muted-foreground">Số dòng báo giá</div>
                <div className="font-semibold">{effectiveRows.length}</div>
              </div>

              <div className="rounded-md border px-3 py-2 text-sm">
                <div className="text-muted-foreground">Kiểu giá mặc định</div>
                <div className="font-semibold">
                  {priceMode === "retail" ? "Giá bán lẻ" : "Giá cửa hàng"}
                </div>
              </div>

              <div className="rounded-md border px-3 py-2 text-sm">
                <div className="text-muted-foreground">Giá báo trung bình</div>
                <div className="font-semibold">
                  {formatCurrency(avgSelectedPrice)}
                </div>
              </div>
            </div>

            <div className="hidden print:block">
              <div className="mb-3 text-center">
                <h2 className="text-xl font-bold">BẢNG BÁO GIÁ</h2>
                <p className="text-sm text-muted-foreground">
                  Ngày in: {new Date().toLocaleDateString("vi-VN")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Kiểu giá mặc định: {priceMode === "retail" ? "Giá bán lẻ" : "Giá cửa hàng"}
                </p>
              </div>
            </div>

            <Table<QuoteRow>
              rowKey="key"
              loading={loading}
              dataSource={filteredRows}
              columns={columns}
              style={{ width: "100%" }}
              tableLayout="auto"
              scroll={{ x: true }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                preserveSelectedRowKeys: true,
              }}
              rowClassName={(record) =>
                selectedRowKeys.map(String).includes(String(record.key))
                  ? "custom-selected-row"
                  : ""
              }
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
              }}
              locale={{
                emptyText: "Không có mặt hàng phù hợp",
              }}
              summary={(pageData) => {
                const source = selectedRowKeys.length > 0 ? selectedRows : pageData;

                const avgPrice = source.length
                  ? Math.round(
                    source.reduce((sum, item) => sum + getQuotePrice(item), 0) /
                    source.length
                  )
                  : 0;

                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <span className="font-semibold">
                        {selectedRowKeys.length > 0
                          ? `Đang chọn ${selectedRows.length} mặt hàng`
                          : `Trang hiện tại: ${pageData.length} mặt hàng`}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right" colSpan={2}>
                      <span className="font-semibold">
                        TB giá gốc:{" "}
                        {formatCurrency(
                          source.length
                            ? Math.round(
                              source.reduce(
                                (sum, item) => sum + getDefaultPrice(item),
                                0
                              ) / source.length
                            )
                            : 0
                        )}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right" colSpan={2}>
                      <span className="font-semibold">
                        TB giá báo: {formatCurrency(avgPrice)}
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}