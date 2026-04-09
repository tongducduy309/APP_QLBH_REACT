import { Input, Modal } from "antd";
import { NumberInput } from "@/components/ui/number-input";
import type {
  PurchaseReceiptForm,
} from "../../purchase-receipts/types/purchase-receipt.types";

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

export function PurchaseReceiptDialog({
  open,
  variantLabel,
  value,
  onClose,
  onSubmit,
  onChange,
  loading = false,
}: Props) {
  const safeQuantity = Number(value.totalQuantity ?? 0);
  const safeCost = Number(value.cost ?? 0);
  const safeTotalCost = Number(value.totalCost ?? 0);

  const suggestedUnitCost =
    safeQuantity > 0 ? safeTotalCost / safeQuantity : 0;

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
      width={620}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: 8,
          paddingLeft: 8,
        },
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Số lượng nhập</label>
            <NumberInput
              className="w-full"
              value={safeQuantity}
              onValueChange={(next) => {
                const qty = next < 0 ? 0 : next;

                onChange({
                  ...value,
                  totalQuantity: qty,
                });
              }}
              placeholder="Nhập số lượng"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tổng giá trị lô nhập</label>
            <NumberInput
              className="w-full"
              value={safeTotalCost}
              onValueChange={(next) => {
                const total = next < 0 ? 0 : next;

                onChange({
                  ...value,
                  totalCost: total,
                });
              }}
              placeholder="Nhập tổng giá trị"
            />
          </div>

        </div>



        <div>
          <label className="mb-1 block text-sm font-medium">Giá nhập</label>
          <NumberInput
            className="w-full"
            value={safeCost}
            onValueChange={(next) => {
              const cost = next < 0 ? 0 : next;

              onChange({
                ...value,
                cost
              });
            }}
            placeholder={
              suggestedUnitCost > 0
                ? `Gợi ý: ${Math.round(suggestedUnitCost).toLocaleString("vi-VN")}`
                : "Nhập đơn giá"
            }
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Đơn giá trên 1 đơn vị.
            {safeQuantity > 0 && safeTotalCost > 0
              ? ` Gợi ý: ${Math.round(suggestedUnitCost).toLocaleString("vi-VN")} = Tổng giá nhập / Số lượng nhập`
              : ""}
          </p>
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
      <div className="border-b pb-2 mt-3">
          <span className="text-sm text-muted-foreground">Phiếu nhập này sẽ cộng trực tiếp vào tồn kho hiện có.</span>
        </div>
    </Modal>
  );
}