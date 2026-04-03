// src/modules/inventory/components/InventoryEditDialog.tsx

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
import { Switch } from "@/components/ui/switch";
import type { InventoryEditForm } from "../types/inventory.types";

type Props = {
  open: boolean;
  variantLabel: string;
  value: InventoryEditForm;
  onClose: () => void;
  onChange: (value: InventoryEditForm) => void;
  onSubmit: () => void;
};

export function InventoryEditDialog({
  open,
  variantLabel,
  value,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tồn kho biến thể</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Biến thể</Label>
            <Input value={variantLabel} readOnly />
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

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <div className="flex h-10 items-center rounded-md border px-3">
              <Switch
                checked={value.active}
                onCheckedChange={(checked: boolean) =>
                  onChange({ ...value, active: checked })
                }
              />
              <span className="ml-3 text-sm text-muted-foreground">
                {value.active ? "Hoạt động" : "Ngưng"}
              </span>
            </div>
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