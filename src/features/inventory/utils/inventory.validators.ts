// src/modules/inventory/utils/inventory.validators.ts

import { toast } from "sonner";
import type { ProductForm } from "../types/inventory.types";

export function validateProductForm(
  form: ProductForm
) {

  if (!form.name.trim()) {
    toast.info("Vui lòng nhập tên sản phẩm.");
    return false;
  }

  if (!form.categoryName.trim()) {
    toast.info("Vui lòng nhập danh mục.");
    return false;
  }

  if (!form.baseUnit.trim()) {
    toast.info("Vui lòng nhập đơn vị cơ bản.");
    return false;
  }

  if (form.variants.length === 0) {
    toast.info("Sản phẩm phải có ít nhất 1 biến thể.");
    return false;
  }

  if (form.description?.length > 250) {
    toast.info("Mô tả không được vượt quá 250 ký tự.");
    return false;
  }

//   const duplicatedSku = inventoryItems.some((item) => {
//     const sameSku = item.sku.trim().toLowerCase() === form.sku.trim().toLowerCase();
//     const isSameEditingItem = item.id === editingProductId;
//     return sameSku && !isSameEditingItem;
//   });

//   if (duplicatedSku) {
//     toast.info("SKU đã tồn tại.");
//     return false;
//   }

  const seenVariantCodes = new Set<string>();

  for (const variant of form.variants) {
    if (!variant.variantCode.trim()) {
      toast.info("Mỗi biến thể phải có loại.");
      return false;
    }

    if (Number(variant.weight ?? 0) < 0) {
      toast.info("Trọng lượng biến thể không hợp lệ.");
      return false;
    }

    if (Number(variant.retailPrice ?? 0) < 0 || Number(variant.storePrice ?? 0) < 0) {
      toast.info("Giá của biến thể không hợp lệ.");
      return false;
    }

    if (Number(variant.storePrice ?? 0) > Number(variant.retailPrice ?? 0)) {
      toast.info("Giá cửa hàng không nên lớn hơn giá bán lẻ.");
      return false;
    }

    if (Number(variant.remainingQty ?? 0) < 0) {
      toast.info("Tồn kho biến thể không hợp lệ.");
      return false;
    }

    if (Number(variant.costPrice ?? 0) < 0) {
      toast.info("Giá vốn không hợp lệ.");
      return false;
    }

    const normalizedCode = variant.variantCode.trim().toLowerCase();
    if (seenVariantCodes.has(normalizedCode)) {
      toast.info("Biến thể bị trùng loại.");
      return false;
    }
    seenVariantCodes.add(normalizedCode);
  }

  return true;
}

export function validateInventoryEditForm(form: {
  remainingQty: number;
  costPrice: number;
}) {
  if (Number.isNaN(form.remainingQty) || form.remainingQty < 0) {
    toast.info("Tồn kho không hợp lệ.");
    return false;
  }

  if (Number.isNaN(form.costPrice) || form.costPrice < 0) {
    toast.info("Giá vốn không hợp lệ.");
    return false;
  }

  return true;
}