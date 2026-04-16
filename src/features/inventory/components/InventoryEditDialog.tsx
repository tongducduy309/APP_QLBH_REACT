import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import type { InventoryEditForm } from "../types/inventory.types";
import { useRef } from "react";

type Props = {
  open: boolean;
  productName: string;
  value: InventoryEditForm;
  onClose: () => void;
  onChange: (value: InventoryEditForm) => void;
  onSubmit: () => void;
};

export function InventoryEditDialog({
  open,
  productName,
  value,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
      >
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tồn kho biến thể</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sản phẩm</Label>
            <Input value={productName} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Mã kho</Label>
            <Input
              ref={inputRef}
              value={value.inventoryCode}
              onChange={(e) => onChange({ ...value, inventoryCode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Tồn kho còn lại</Label>
            <NumberInput
              value={value.remainingQty}
              onValueChange={(next) => onChange({ ...value, remainingQty: next })}
            />
          </div>

          <div className="space-y-2">
            <Label>Giá vốn</Label>
            <NumberInput
              value={value.costPrice}
              onValueChange={(next) => onChange({ ...value, costPrice: next })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>Lưu tồn kho</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}