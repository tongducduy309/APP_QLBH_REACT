import { useEffect, useMemo, useState } from "react";
import { Form, Input, Modal, Select, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { getAllInventory } from "@/services/product-api";
import {
  createPurchaseReceipt,
  getPurchaseReceipts,
} from "@/services/purchase-receipt-api";

import type {
  ProductInventoryRes,
  ProductVariantInventoryRes,
} from "@/features/inventory/types/inventory.types";
import type {
  PurchaseReceiptCreateReq,
  PurchaseReceiptMethod,
  PurchaseReceiptRes,
} from "../types/purchase-receipt.types";

type PurchaseReceiptTableRow = PurchaseReceiptRes & {
  key: string;
};

type VariantOption = {
  label: string;
  value: number;
  productName: string;
  variantCode: string;
  sku?: string;
  remainingQty?: number;
  costPrice?: number;
};

const MAX_NOTE_LENGTH = 250;

const purchaseReceiptMethodOptions: {
  label: string;
  value: PurchaseReceiptMethod;
  description: string;
}[] = [
    {
      label: "Cộng dồn tồn kho",
      value: "ADDITIVE",
      description:
        "Dùng cho sắt, thép, vật tư có thể nhập thêm và cộng vào tồn hiện có.",
    },
    {
      label: "Tạo tồn kho riêng",
      value: "SEPARATE",
      description:
        "Dùng cho tôn cuộn hoặc hàng cần theo dõi riêng từng lần nhập.",
    },
  ];

const initialFormValues: PurchaseReceiptCreateReq = {
  productVariantId: undefined,
  purchaseReceiptMethod: undefined,
  totalQuantity: undefined,
  cost: undefined,
  supplier: "",
  note: "",
};

function buildVariantOptions(products: ProductInventoryRes[]): VariantOption[] {
  const result: VariantOption[] = [];

  products.forEach((product) => {
    (product.variants || []).forEach((variant: ProductVariantInventoryRes) => {
      if (!variant.variantId) return;

      result.push({
        value: variant.variantId,
        label: `${product.name} - ${variant.variantCode || variant.sku || "Biến thể"}`,
        productName: product.name,
        variantCode: variant.variantCode || "",
        sku: variant.sku,
        remainingQty: variant.remainingQty,
        costPrice: variant.costPrice,
      });
    });
  });

  return result;
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
}

function getMethodLabel(method?: PurchaseReceiptMethod) {
  switch (method) {
    case "ADDITIVE":
      return "Cộng dồn tồn kho";
    case "SEPARATE":
      return "Tạo tồn kho riêng";
    default:
      return "-";
  }
}

function getMethodColor(method?: PurchaseReceiptMethod) {
  switch (method) {
    case "ADDITIVE":
      return "blue";
    case "SEPARATE":
      return "purple";
    default:
      return "default";
  }
}

export function PurchaseReceiptsPage() {
  const [form] = Form.useForm<PurchaseReceiptCreateReq>();

  const [receipts, setReceipts] = useState<PurchaseReceiptRes[]>([]);
  const [inventory, setInventory] = useState<ProductInventoryRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const variantOptions = useMemo(() => buildVariantOptions(inventory), [inventory]);
  const selectedVariantId = Form.useWatch("productVariantId", form);
  const selectedMethod = Form.useWatch("purchaseReceiptMethod", form);
  const watchedTotalQuantity = Form.useWatch("totalQuantity", form);
  const watchedCost = Form.useWatch("cost", form);
  const watchedNote = Form.useWatch("note", form);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return variantOptions.find((item) => item.value === selectedVariantId) || null;
  }, [selectedVariantId, variantOptions]);

  const selectedMethodMeta = useMemo(() => {
    return purchaseReceiptMethodOptions.find((item) => item.value === selectedMethod);
  }, [selectedMethod]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseReceipts();
      setReceipts(data || []);
    } catch (error) {
      console.error("Lỗi tải phiếu nhập", error);
      toast.error("Không thể tải danh sách phiếu nhập.");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      const data = await getAllInventory();
      setInventory(data || []);
    } catch (error) {
      console.error("Lỗi tải tồn kho", error);
      toast.error("Không thể tải danh sách biến thể sản phẩm.");
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchInventory();
  }, []);

  const openCreateModal = () => {
    form.setFieldsValue(initialFormValues);
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: PurchaseReceiptCreateReq = {
        productVariantId: values.productVariantId,
        purchaseReceiptMethod: values.purchaseReceiptMethod,
        totalQuantity: values.totalQuantity,
        cost: values.cost,
        supplier: values.supplier?.trim() || undefined,
        note: values.note?.trim() || undefined,
      };

      setSubmitLoading(true);
      await createPurchaseReceipt(payload);

      toast.success("Tạo phiếu nhập kho thành công.");
      closeCreateModal();
      await fetchReceipts();
      await fetchInventory();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) return;

      console.error("Lỗi tạo phiếu nhập", error);
      toast.error("Tạo phiếu nhập kho thất bại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalReceiptValue = useMemo(() => {
    return receipts.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [receipts]);

  const totalReceiptQuantity = useMemo(() => {
    return receipts.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  }, [receipts]);

  const columns: ColumnsType<PurchaseReceiptTableRow> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (value: string, record) => (
        <div>
          <div className="font-medium">{value || "-"}  {record.productVariantCode ? `(${record.productVariantCode})` : ""}</div>
          <div className="text-xs text-muted-foreground">
            SKU: {record.productVariantSKU || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Phương thức nhập",
      dataIndex: "purchaseReceiptMethod",
      key: "purchaseReceiptMethod",
      render: (value?: PurchaseReceiptMethod) => (
        <Tag color={getMethodColor(value)}>{getMethodLabel(value)}</Tag>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Giá nhập",
      dataIndex: "cost",
      key: "cost",
      render: (value?: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      render: (value?: string) => value || "-",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (value?: string) => {
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
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value?: string) => formatDateTime(value),
    },
  ];

  const dataSource: PurchaseReceiptTableRow[] = receipts.map((item, index) => ({
    ...item,
    key: String(item.id ?? index),
  }));

  return (
    <PageShell>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Phiếu nhập kho</CardTitle>
              <CardDescription>
                Tạo phiếu nhập kho theo kiểu cộng dồn hoặc tạo tồn riêng.
              </CardDescription>
            </div>

            <Space wrap>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  fetchReceipts();
                  fetchInventory();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tải lại
              </Button>

              <Button type="button" onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu nhập
              </Button>
            </Space>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Tổng phiếu nhập</div>
                <div className="mt-2 text-2xl font-semibold">{receipts.length}</div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Tổng số lượng nhập</div>
                <div className="mt-2 text-2xl font-semibold">{totalReceiptQuantity}</div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Tổng giá trị nhập</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatCurrency(totalReceiptValue)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách phiếu nhập</CardTitle>
            <CardDescription>
              Theo dõi lịch sử nhập kho và kiểu xử lý tồn kho của từng phiếu nhập.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table<PurchaseReceiptTableRow>
              rowKey="key"
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
              locale={{ emptyText: "Chưa có phiếu nhập nào." }}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        title="Tạo phiếu nhập kho"
        open={createOpen}
        onCancel={closeCreateModal}
        onOk={handleSubmit}
        okText="Lưu phiếu nhập"
        cancelText="Hủy"
        confirmLoading={submitLoading}
        destroyOnHidden
      >
        <Form<PurchaseReceiptCreateReq>
          form={form}
          layout="vertical"
          initialValues={initialFormValues}
        >
          <Form.Item
            label="Biến thể sản phẩm"
            name="productVariantId"
            rules={[{ required: true, message: "Vui lòng chọn biến thể sản phẩm." }]}
          >
            <Select
              showSearch
              loading={inventoryLoading}
              placeholder="Chọn biến thể"
              optionFilterProp="label"
              options={variantOptions}
            />
          </Form.Item>

          {selectedVariant && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-3 text-sm">
              <div>
                <span className="font-medium">Sản phẩm:</span> {selectedVariant.productName}
              </div>
              <div>
                <span className="font-medium">Biến thể:</span> {selectedVariant.variantCode || "-"}
              </div>
              <div>
                <span className="font-medium">SKU:</span> {selectedVariant.sku || "-"}
              </div>
              <div>
                <span className="font-medium">Tồn hiện tại:</span> {selectedVariant.remainingQty ?? 0}
              </div>
              <div>
                <span className="font-medium">Giá vốn hiện tại:</span>{" "}
                {formatCurrency(selectedVariant.costPrice ?? 0)}
              </div>
            </div>
          )}

          <Form.Item
            label="Kiểu xử lý tồn kho"
            name="purchaseReceiptMethod"
            rules={[{ required: true, message: "Vui lòng chọn kiểu nhập kho." }]}
          >
            <Select
              placeholder="Chọn kiểu xử lý tồn kho"
              options={purchaseReceiptMethodOptions.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />
          </Form.Item>

          {selectedMethodMeta && (
            <div className="mb-4 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              {selectedMethodMeta.description}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              label="Số lượng nhập"
              name="totalQuantity"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng." },
                {
                  validator: async (_, value) => {
                    if (value == null || Number(value) <= 0) {
                      throw new Error("Số lượng phải lớn hơn 0.");
                    }
                  },
                },
              ]}
            >
              <NumberInput
                className="w-full"
                value={Number(watchedTotalQuantity ?? 0)}
                onValueChange={(next) => {
                  form.setFieldValue("totalQuantity", next < 0 ? 0 : next);
                }}
                placeholder="Nhập số lượng"
              />
            </Form.Item>

            <Form.Item
              label="Giá nhập"
              name="cost"
              rules={[
                { required: true, message: "Vui lòng nhập giá nhập." },
                {
                  validator: async (_, value) => {
                    if (value == null || Number(value) < 0) {
                      throw new Error("Giá nhập không hợp lệ.");
                    }
                  },
                },
              ]}
            >
              <NumberInput
                className="w-full"
                value={Number(watchedCost ?? 0)}
                onValueChange={(next) => {
                  form.setFieldValue("cost", next < 0 ? 0 : next);
                }}
                placeholder="Nhập giá nhập"
              />
            </Form.Item>
          </div>

          <Form.Item label="Nhà cung cấp" name="supplier">
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <label className="text-sm font-medium">Ghi chú</label>
              <span className="text-xs text-muted-foreground">
                {(watchedNote?.length ?? 0)}/{MAX_NOTE_LENGTH}
              </span>
            </div>

            <Form.Item
              name="note"
              className="mb-0"
              rules={[
                {
                  validator: async (_, value) => {
                    if ((value?.length ?? 0) > MAX_NOTE_LENGTH) {
                      throw new Error(`Ghi chú không được vượt quá ${MAX_NOTE_LENGTH} ký tự.`);
                    }
                  },
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                maxLength={MAX_NOTE_LENGTH}
                placeholder="Ví dụ: tôn cuộn nhập riêng từng cuộn, hoặc sắt nhập cộng dồn"
                onChange={(e) => {
                  form.setFieldValue("note", e.target.value.slice(0, MAX_NOTE_LENGTH));
                }}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </PageShell>
  );
}