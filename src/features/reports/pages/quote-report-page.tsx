import { useEffect, useMemo, useState } from "react";
import {
  Checkbox,
  DatePicker,
  Input,
  Modal,
  Radio,
  Select,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Download, FileText, Printer, Search } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

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
import type { OrderDetailRes, OrderRes } from "@/types/order";
import { OrderStatus } from "@/types/order";
import {
  downloadQuotation,
  previewQuotation,
  printQuotation,
} from "@/features/print/services/Quotation-pdf-print.service";

type PriceMode = "retail" | "store";
type QuoteAction = "preview" | "print" | "download" | null;

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

type QuoteMetaForm = {
  createdAt: Dayjs | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
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
      productId: Number(product.id),
      productName: product.name ?? "",
      categoryName: product.categoryName ?? "",
      baseUnit: product.baseUnit ?? "",
      description: product.description ?? "",
      productActive: Boolean(product.active),

      inventoryId: variant.inventoryId ?? null,
      variantId: variant.variantId ?? null,
      sku: variant.sku ?? "",
      lotCode: variant.lotCode ?? "",
      variantCode: variant.variantCode ?? "",
      weight: Number(variant.weight ?? 0),
      retailPrice: Number(variant.retailPrice ?? 0),
      storePrice: Number(variant.storePrice ?? 0),
      remainingQty: Number(variant.remainingQty ?? 0),
      costPrice: Number(variant.costPrice ?? 0),
      active: Boolean(variant.active),
    }))
  );
}

function buildQuoteCode(createdAt?: Dayjs | null) {
  const now = createdAt?.toDate() ?? new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
}

function buildQuotationOrder(
  rows: QuoteRow[],
  priceMode: PriceMode,
  editedPrices: Record<string, number>,
  meta: QuoteMetaForm
): OrderRes {
  const getDefaultPrice = (row: QuoteRow) =>
    priceMode === "retail"
      ? Number(row.retailPrice ?? 0)
      : Number(row.storePrice ?? 0);

  const getQuotePrice = (row: QuoteRow) => {
    const edited = editedPrices[String(row.key)];
    return edited ?? getDefaultPrice(row);
  };

  const details: OrderDetailRes[] = rows.map((row, index) => {
    const price = getQuotePrice(row);

    return {
      id: index + 1,
      index,
      name: row.productName,
      baseUnit: row.baseUnit || "",
      quantity: null,
      length: null,
      totalQuantity: null,
      price,
      sku: row.sku || "",
      inventoryId: row.inventoryId,
      productVariantId: row.variantId,
      kind: "INVENTORY" as any,
    };
  });

  const subtotal = details.reduce(
    (sum, item) =>
      sum + Number(item.price ?? 0) * Number(item.totalQuantity ?? 0),
    0
  );

  return {
    id: 0,
    code: buildQuoteCode(meta.createdAt),
    customer: {
      id: 0,
      name: meta.customerName.trim(),
      phone: meta.customerPhone.trim(),
      address: meta.customerAddress.trim(),
    } as any,
    note: meta.note.trim(),
    tax: 0,
    taxAmount: 0,
    paidAmount: 0,
    remainingAmount: subtotal,
    shippingFee: 0,
    subtotal,
    paidDept: 0,
    changeAmount: 0,
    total: subtotal,
    details,
    status: OrderStatus.DRAFT,
    createdAt: (meta.createdAt ?? dayjs()).toISOString(),
  };
}

const createDefaultQuoteMeta = (): QuoteMetaForm => ({
  createdAt: dayjs(),
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  note: "",
});

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
  const [pdfLoading, setPdfLoading] = useState(false);

  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteAction, setQuoteAction] = useState<QuoteAction>(null);
  const [quoteMeta, setQuoteMeta] = useState<QuoteMetaForm>(createDefaultQuoteMeta());

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
    return allRows.filter((item) => selectedSet.has(String(item.key)));
  }, [allRows, selectedRowKeys]);

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

  const openQuoteDialog = (action: QuoteAction) => {
    if (!effectiveRows.length) {
      message.warning("Không có dữ liệu để tạo báo giá");
      return;
    }

    setQuoteAction(action);
    setQuoteMeta((prev) => ({
      ...createDefaultQuoteMeta(),
      customerName: prev.customerName,
      customerPhone: prev.customerPhone,
      customerAddress: prev.customerAddress,
      note: prev.note,
    }));
    setQuoteDialogOpen(true);
  };

  const handleSubmitQuoteDialog = async () => {
    if (!quoteAction) return;

    const quotationOrder = buildQuotationOrder(
      effectiveRows,
      priceMode,
      editedPrices,
      quoteMeta
    );

    try {
      if (quoteAction === "preview") {
        previewQuotation(quotationOrder, {
          paperSize: "A4",
          pageOrientation: "portrait",
        });
        setQuoteDialogOpen(false);
        return;
      }

      if (quoteAction === "download") {
        downloadQuotation(quotationOrder, {
          paperSize: "A4",
          pageOrientation: "portrait",
        });
        setQuoteDialogOpen(false);
        return;
      }

      if (quoteAction === "print") {
        setPdfLoading(true);
        await printQuotation(quotationOrder, {
          paperSize: "A4",
          pageOrientation: "portrait",
        });
        setQuoteDialogOpen(false);
      }
    } catch (error) {
      console.error("Lỗi thao tác báo giá", error);
      message.error("Không thể thực hiện thao tác báo giá");
    } finally {
      setPdfLoading(false);
    }
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

  const dialogTitle =
    quoteAction === "preview"
      ? "Thông tin để xem bảng báo giá"
      : quoteAction === "print"
      ? "Thông tin để in bảng báo giá"
      : "Thông tin để tải bảng báo giá";

  return (
    <PageShell>
      <div className="space-y-4 print:space-y-2">
        <Card className="print:border-none print:shadow-none">
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

              <Button variant="outline" onClick={() => openQuoteDialog("preview")}>
                <FileText className="mr-2 h-4 w-4" />
                Xem PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => openQuoteDialog("print")}
                disabled={pdfLoading}
              >
                <Printer className="mr-2 h-4 w-4" />
                {pdfLoading ? "Đang in..." : "In báo giá"}
              </Button>

              <Button variant="outline" onClick={() => openQuoteDialog("download")}>
                <Download className="mr-2 h-4 w-4" />
                Tải PDF
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
                const source =
                  selectedRowKeys.length > 0 ? selectedRows : pageData;

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

      <Modal
        open={quoteDialogOpen}
        title={dialogTitle}
        onCancel={() => setQuoteDialogOpen(false)}
        onOk={handleSubmitQuoteDialog}
        okText={
          quoteAction === "preview"
            ? "Xem bảng báo giá"
            : quoteAction === "print"
            ? "In bảng báo giá"
            : "Tải bảng báo giá"
        }
        cancelText="Hủy"
        confirmLoading={pdfLoading}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Thời gian</label>
            <DatePicker
              
              format="DD/MM/YYYY"
              className="w-full"
              value={quoteMeta.createdAt}
              onChange={(value) =>
                setQuoteMeta((prev) => ({
                  ...prev,
                  createdAt: value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Gửi đến</label>
            <Input
              value={quoteMeta.customerName}
              onChange={(e) =>
                setQuoteMeta((prev) => ({
                  ...prev,
                  customerName: e.target.value,
                }))
              }
              placeholder="Nhập tên người nhận / đơn vị nhận"
            />
          </div>

          {/* <div>
            <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
            <Input
              value={quoteMeta.customerPhone}
              onChange={(e) =>
                setQuoteMeta((prev) => ({
                  ...prev,
                  customerPhone: e.target.value,
                }))
              }
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Địa chỉ</label>
            <Input
              value={quoteMeta.customerAddress}
              onChange={(e) =>
                setQuoteMeta((prev) => ({
                  ...prev,
                  customerAddress: e.target.value,
                }))
              }
              placeholder="Nhập địa chỉ"
            />
          </div> */}

          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <Input.TextArea
              rows={4}
              value={quoteMeta.note}
              onChange={(e) =>
                setQuoteMeta((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              placeholder="Nhập ghi chú báo giá"
            />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}