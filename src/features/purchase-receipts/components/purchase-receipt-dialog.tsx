import { Form, Input, Modal, Select } from "antd";
import { NumberInput } from "@/components/ui/number-input";
import { formatCurrency } from "@/lib/utils";
import type {
  PurchaseReceiptCreateReq,
} from "../types/purchase-receipt.types";
import { useEffect, useMemo, useState } from "react";
import { getAllProductVariants } from "@/services/product-api";
import type { ProductVariantRes } from "@/types/product";
import { removeVietnameseTones } from "@/utils/string";

type VariantOption = {
  label: string;
  value: number;
  productName: string;
  variantCode: string;
  weight?: string;
  sku?: string;
};

type PurchaseReceiptDialogProps = {
  open: boolean;
  form: ReturnType<typeof Form.useForm<PurchaseReceiptCreateReq>>[0];
  loading?: boolean;
  inventoryLoading?: boolean;
  watchedTotalQuantity?: number;
  watchedCost?: number;
  watchedTotalCost?: number;
  watchedNote?: string;
  maxNoteLength?: number;
  onClose: () => void;
  onSubmit: () => void;
};

function buildVariantOptions(variants: ProductVariantRes[]): VariantOption[] {
  return variants
    .filter((variant) => !!variant.id)
    .map((variant) => ({
      value: Number(variant.id),
      label: `${variant.productName} ${variant.weight ? `(${variant.weight})` : ""} - ${variant.variantCode || variant.sku || "Biến thể"}`,
      productName: variant.productName || "",
      variantCode: variant.variantCode || "",
      weight: variant.weight ? variant.weight + "" : "",
      sku: variant.sku,
    }));
}

export function PurchaseReceiptDialog({
  open,
  form,
  loading = false,
  inventoryLoading = false,
  watchedTotalQuantity,
  watchedCost,
  watchedTotalCost,
  watchedNote,
  maxNoteLength = 250,
  onClose,
  onSubmit,
}: PurchaseReceiptDialogProps) {
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const selectedVariantId = Form.useWatch("productVariantId", form);


  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return variantOptions.find((item) => item.value === selectedVariantId) || null;
  }, [selectedVariantId, variantOptions]);

  const safeQuantity = Number(watchedTotalQuantity ?? 0);
  const safeCost = Number(watchedCost ?? 0);
  const safeTotalCost = Number(watchedTotalCost ?? 0);
  const suggestedUnitCost = safeQuantity > 0 ? safeTotalCost / safeQuantity : 0;

  useEffect(() => {
    if (!open) return;

    const fetchVariants = async () => {
      try {
        const data = await getAllProductVariants();
        setVariantOptions(buildVariantOptions(data || []));
      } catch (error) {
        console.error("Không thể tải danh sách biến thể sản phẩm:", error);
        // toast.error("Không thể tải danh sách biến thể sản phẩm.");
      }
    };

    fetchVariants();
  }, [open]);

  return (
    <Modal
      title="Tạo phiếu nhập kho"
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText="Lưu phiếu nhập"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
      width={700}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: 8,
          paddingLeft: 8,
        },
      }}
    >
      <Form<PurchaseReceiptCreateReq> form={form} layout="vertical">
        <Form.Item
          label="Biến thể sản phẩm"
          name="productVariantId"
          rules={[{ required: true, message: "Vui lòng chọn biến thể sản phẩm." }]}
        >
          <Select
            showSearch
            loading={inventoryLoading}
            placeholder="Chọn biến thể"
            filterOption={(input, option) => {
    const label = option?.label ?? "";

    return removeVietnameseTones(label)
      .includes(removeVietnameseTones(input));
  }}
            options={variantOptions}
          />
        </Form.Item>

        {selectedVariant && (
          <div className="mb-4 rounded-lg border bg-muted/30 p-3 text-sm">
            <div>
              <span className="font-medium">Sản phẩm:</span> {selectedVariant.productName} {selectedVariant?.weight ? `(${selectedVariant.weight})` : ""}
            </div>
            <div>
              <span className="font-medium">Biến thể:</span> {selectedVariant.variantCode || "-"}
            </div>
            <div>
              <span className="font-medium">SKU:</span> {selectedVariant.sku || "-"}
            </div>
          </div>
        )}

        <Form.Item
          label="Mã kho hàng"
          name="inventoryCode"
        >
          <Input placeholder="Nhập Mã kho hàng" />
        </Form.Item>

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
              value={safeQuantity}
              onValueChange={(next) => {
                const normalizedQty = next < 0 ? 0 : next;
                const currentCost = Number(form.getFieldValue("cost") ?? 0);
                const currentTotalCost = Number(form.getFieldValue("totalCost") ?? 0);

                form.setFieldValue("totalQuantity", normalizedQty);

                if (currentTotalCost > 0 && normalizedQty > 0) {
                  form.setFieldValue("cost", currentTotalCost / normalizedQty);
                } else {
                  form.setFieldValue("totalCost", normalizedQty * currentCost);
                }
              }}
              placeholder="Nhập số lượng"
            />
          </Form.Item>

          <Form.Item
            label="Tổng giá trị lô nhập"
            name="totalCost"
            rules={[
              { required: true, message: "Vui lòng nhập tổng giá trị lô nhập." },
              {
                validator: async (_, value) => {
                  if (value == null || Number(value) < 0) {
                    throw new Error("Tổng giá trị không hợp lệ.");
                  }
                },
              },
            ]}
          >
            <NumberInput
              className="w-full"
              value={safeTotalCost}
              onValueChange={(next) => {
                const normalizedTotalCost = next < 0 ? 0 : next;
                form.setFieldValue("totalCost", normalizedTotalCost);

                if (safeQuantity > 0) {
                  form.setFieldValue("cost", normalizedTotalCost / safeQuantity);
                }
              }}
              placeholder="Nhập tổng giá trị lô nhập"
            />
          </Form.Item>
        </div>

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
          extra={
            <span className="text-xs text-muted-foreground">
              Đơn giá trên 1 đơn vị.
              {safeQuantity > 0 && safeTotalCost > 0
                ? ` Giá trị gợi ý: ${formatCurrency(suggestedUnitCost)} = Tổng giá trị / Số lượng.`
                : ""}
            </span>
          }
        >
          <NumberInput
            className="w-full"
            value={safeCost}
            onValueChange={(next) => {
              const normalizedCost = next < 0 ? 0 : next;
              form.setFieldValue("cost", normalizedCost);
              form.setFieldValue("totalCost", safeQuantity * normalizedCost);
            }}
            placeholder={
              suggestedUnitCost > 0
                ? `Gợi ý: ${Math.round(suggestedUnitCost).toLocaleString("vi-VN")}`
                : "Nhập đơn giá"
            }
          />
        </Form.Item>

        <Form.Item label="Nhà cung cấp" name="supplier">
          <Input placeholder="Nhập tên nhà cung cấp" />
        </Form.Item>

        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <label className="text-sm font-medium">Ghi chú</label>
            <span className="text-xs text-muted-foreground">
              {(watchedNote?.length ?? 0)}/{maxNoteLength}
            </span>
          </div>

          <Form.Item
            name="note"
            className="mb-0"
            rules={[
              {
                validator: async (_, value) => {
                  if ((value?.length ?? 0) > maxNoteLength) {
                    throw new Error(`Ghi chú không được vượt quá ${maxNoteLength} ký tự.`);
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={maxNoteLength}
              placeholder="Ví dụ: tôn cuộn nhập riêng từng cuộn, hoặc sắt nhập cộng dồn"
              onChange={(e) => {
                form.setFieldValue("note", e.target.value.slice(0, maxNoteLength));
              }}
            />
          </Form.Item>
        </div>
      </Form>
      <div className="border-b pb-2">
        <span className="text-sm text-muted-foreground">Phiếu nhập này sẽ tạo một lô hàng riêng biệt, không ảnh hưởng tồn kho cũ.</span>
      </div>
    </Modal>
  );
}