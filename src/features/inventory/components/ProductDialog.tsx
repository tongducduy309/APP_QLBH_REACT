// src/modules/inventory/components/ProductDialog.tsx

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ProductVariantEditor } from "./ProductVariantEditor";
import type {
  ProductForm,
  ProductVariantInventoryRes,
} from "../types/inventory.types";

type Props = {
  open: boolean;
  isEditing: boolean;
  value: ProductForm;
  onClose: () => void;
  onChange: (value: ProductForm) => void;
  onAddVariant: () => void;
  onRemoveVariant: (variantIndex: number) => void;
  onUpdateVariant: (variantIndex: number, next: ProductVariantInventoryRes) => void;
  onSubmit: () => void;
};

export function ProductDialog({
  open,
  isEditing,
  value,
  onClose,
  onChange,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  onSubmit,
}: Props) {
  const productVariantRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const prevVariantCountRef = useRef(value.variants.length);
  const shouldFocusNewSkuRef = useRef(false);

  const getVariantKey = (variant: ProductVariantInventoryRes, index: number) =>
    String(
      variant.inventoryId ??
      variant.variantId ??
      variant.sku ??
      `new-${index}`
    );

  const handleAddVariant = () => {
    shouldFocusNewSkuRef.current = true;
    onAddVariant();
  };

  useEffect(() => {
    if (!open) return;

    const prevCount = prevVariantCountRef.current;
    const currentCount = value.variants.length;

    if (
      shouldFocusNewSkuRef.current &&
      currentCount > prevCount &&
      currentCount > 0
    ) {
      const lastVariant = value.variants[currentCount - 1];
      const key = getVariantKey(lastVariant, currentCount - 1);

      requestAnimationFrame(() => {
        const input = productVariantRefs.current[key];
        input?.focus();
        input?.select?.();
      });

      shouldFocusNewSkuRef.current = false;
    }

    prevVariantCountRef.current = currentCount;
  }, [value.variants, open]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="flex max-h-[92vh] flex-col overflow-hidden p-0 sm:max-w-5xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>
            {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm mới sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tên sản phẩm (*)</Label>
                <Input
                  value={value.name}
                  onChange={(e) => onChange({ ...value, name: e.target.value })}
                  placeholder="Ví dụ: Tôn lạnh màu xanh"
                />
              </div>

              <div className="space-y-2">
                <Label>Danh mục (*)</Label>
                <Input
                  value={value.categoryName}
                  onChange={(e) =>
                    onChange({ ...value, categoryName: e.target.value })
                  }
                  placeholder="Ví dụ: Tôn"
                />
              </div>

              <div className="space-y-2">
                <Label>Đơn vị cơ bản</Label>
                <Input
                  value={value.baseUnit}
                  onChange={(e) =>
                    onChange({ ...value, baseUnit: e.target.value })
                  }
                  placeholder="Ví dụ: mét"
                />
              </div>

              <div className="space-y-2">
                <Label>Trạng thái sản phẩm</Label>
                <div className="flex h-10 items-center rounded-md border px-3">
                  <Switch
                    checked={value.active}
                    onCheckedChange={(checked: boolean) =>
                      onChange({ ...value, active: checked })
                    }
                  />
                  <span className="ml-3 text-sm text-muted-foreground">
                    {value.active ? "Đang bán" : "Ngừng bán"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="product-description">Mô tả</Label>
                  <span
                    className={`text-xs ${(value.description?.length ?? 0) >= 250
                        ? "text-red-500"
                        : "text-muted-foreground"
                      }`}
                  >
                    {value.description?.length ?? 0}/250
                  </span>
                </div>

                <Textarea
                  id="product-description"
                  value={value.description ?? ""}
                  maxLength={250}
                  onChange={(e) =>
                    onChange({ ...value, description: e.target.value })
                  }
                  placeholder="Ghi chú thêm về sản phẩm..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Danh sách biến thể</p>
                  <p className="text-sm text-muted-foreground">
                    Mỗi sản phẩm có thể có nhiều loại, trọng lượng và mức giá khác nhau.
                  </p>
                </div>

                <Button type="button" variant="outline" onClick={handleAddVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm biến thể
                </Button>
              </div>

              <div className="space-y-4">
                {value.variants.map(
                  (variant: ProductVariantInventoryRes, index: number) => {
                    const variantKey = getVariantKey(variant, index);

                    return (
                      <ProductVariantEditor
                        key={variantKey}
                        variant={variant}
                        disableRemove={value.variants.length === 1}
                        skuInputRef={(node) => {
                          productVariantRefs.current[variantKey] = node;
                        }}
                        onRemove={() => onRemoveVariant(index)}
                        onChange={(nextVariant) => onUpdateVariant(index, nextVariant)}
                      />
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>
            {isEditing ? "Lưu thay đổi" : "Lưu sản phẩm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}