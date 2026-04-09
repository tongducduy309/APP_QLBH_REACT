// src/modules/inventory/components/ProductVariantEditor.tsx

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import type { ProductVariantInventoryRes } from "../types/inventory.types";

type Props = {
  variant: ProductVariantInventoryRes;
  onChange: (next: ProductVariantInventoryRes) => void;
  onRemove: () => void;
  disableRemove?: boolean;
  skuInputRef?: (node: HTMLInputElement | null) => void;
};

export function ProductVariantEditor({
  variant,
  onChange,
  skuInputRef,
  onRemove,
  disableRemove,
}: Props) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-medium">Biến thể sản phẩm</p>
          <p className="text-sm text-muted-foreground">
            Ví dụ loại 5 dem, 6 dem, 0.45, 0.50...
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          disabled={disableRemove}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="space-y-2 md:col-span-4">
          <Label>SKU</Label>
          <Input
          ref={skuInputRef}
            value={variant.sku}
            onChange={(e) => onChange({ ...variant, sku: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-5">
          <Label>Loại (*)</Label>
          <Input
            placeholder="Ví dụ: 5 dem"
            value={variant.variantCode}
            onChange={(e) => onChange({ ...variant, variantCode: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label>Trọng lượng</Label>
          <Input
            value={variant.weight}
            placeholder="Ví dụ: Nặng, Nhẹ, 4.2kg,..."
            onChange={(e) => onChange({ ...variant, weight: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label>Giá bán lẻ</Label>
          <NumberInput
            value={variant.retailPrice}
            onValueChange={(value) => onChange({ ...variant, retailPrice: value })}
          />
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label>Giá cửa hàng</Label>
          <NumberInput
            value={variant.storePrice}
            onValueChange={(value) => onChange({ ...variant, storePrice: value })}
          />
        </div>

        {/* <div className="space-y-2 md:col-span-3" hidden={isEditMode}>
          <Label>Tồn kho</Label>
          <NumberInput
            value={variant.remainingQty}
            onValueChange={(value) => onChange({ ...variant, remainingQty: value })}
          />
        </div> */}

        

        <div className="space-y-2 md:col-span-3">
          <Label>Trạng thái</Label>
          <div className="flex h-10 items-center rounded-md border px-3">
            <Switch
              checked={variant.active}
              onCheckedChange={(checked: boolean) =>
                onChange({ ...variant, active: checked })
              }
            />
            <span className="ml-3 text-sm text-muted-foreground">
              {variant.active ? "Đang hoạt động" : "Ngưng sử dụng"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}