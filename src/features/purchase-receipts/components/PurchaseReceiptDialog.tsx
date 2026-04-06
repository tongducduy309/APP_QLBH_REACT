import { Input, Modal, Select } from "antd";
import { NumberInput } from "@/components/ui/number-input";
import type {
  PurchaseReceiptForm,
  PurchaseReceiptMethod,
} from "../types/purchase-receipt.types";

type Props = {
  open: boolean;
  variantLabel: string;
  value: PurchaseReceiptForm;
  onClose: () => void;
  onChange: (next: PurchaseReceiptForm) => void;
  onSubmit: () => void;
  loading?: boolean;
};

const MAX_NOTE_LENGTH = 250;

const purchaseMethodOptions: {
  label: string;
  value: PurchaseReceiptMethod;
}[] = [
  {
    label: "Cộng dồn tồn kho",
    value: "ADDITIVE",
  },
  {
    label: "Tạo tồn kho riêng",
    value: "SEPARATE",
  },
];

export function PurchaseReceiptDialog({
  open,
  variantLabel,
  value,
  onClose,
  onChange,
  onSubmit,
  loading = false,
}: Props) {
  return (
    <Modal
      title={`Nhập hàng${variantLabel ? ` - ${variantLabel}` : ""}`}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText="Lưu phiếu nhập"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kiểu nhập hàng</label>
          <Select
            className="w-full"
            value={value.purchaseReceiptMethod}
            options={purchaseMethodOptions}
            onChange={(next) =>
              onChange({
                ...value,
                purchaseReceiptMethod: next,
              })
            }
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Sắt, thép thường chọn cộng dồn. Tôn cuộn thường chọn tạo tồn kho riêng.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Số lượng nhập</label>
            <NumberInput
              className="w-full"
              value={Number(value.totalQuantity ?? 0)}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  totalQuantity: next < 0 ? 0 : next,
                })
              }
              placeholder="Nhập số lượng"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Giá nhập</label>
            <NumberInput
              className="w-full"
              value={Number(value.cost ?? 0)}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  cost: next < 0 ? 0 : next,
                })
              }
              placeholder="Nhập giá nhập"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nhà cung cấp</label>
          <Input
            value={value.supplier}
            onChange={(e) =>
              onChange({
                ...value,
                supplier: e.target.value,
              })
            }
            placeholder="Nhập tên nhà cung cấp"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium">Ghi chú</label>
            <span className="text-xs text-muted-foreground">
              {(value.note?.length ?? 0)}/{MAX_NOTE_LENGTH}
            </span>
          </div>

          <Input.TextArea
            rows={4}
            value={value.note}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(e) =>
              onChange({
                ...value,
                note: e.target.value.slice(0, MAX_NOTE_LENGTH),
              })
            }
            placeholder="Ghi chú thêm cho phiếu nhập"
          />
        </div>
      </div>
    </Modal>
  );
}