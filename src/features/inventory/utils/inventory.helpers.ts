// src/modules/inventory/utils/inventory.helpers.ts

import { formatCurrency } from "@/lib/utils";
import type { ProductForm, ProductVariantInventoryRes } from "../types/inventory.types";

export const createInitialVariant = (): ProductVariantInventoryRes => ({
  inventoryId: null,
  sku: "",
  lotCode: "",
  originalQty: 0,
  outOfStock: false,
  variantId: null,
  variantCode: "",
  weight: "",
  retailPrice: 0,
  storePrice: 0,
  remainingQty: 0,
  costPrice: 0,
  active: true,
});

export const createInitialForm = (): ProductForm => ({
  sku: "",
  name: "",
  categoryName: "",
  baseUnit: "mét",
  stock: 0,
  description: "",
  active: true,
  variants: [createInitialVariant()],
});

export function getActiveVariants(variants: ProductVariantInventoryRes[]) {
  const activeVariants = variants.filter((variant) => variant.active);
  return activeVariants.length > 0 ? activeVariants : variants;
}

export function getRetailPriceRange(variants: ProductVariantInventoryRes[]) {
  if (!variants.length) return "-";

  const source = getActiveVariants(variants);
  const prices = source.map((variant) => variant.retailPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? formatCurrency(min)
    : `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function getStorePriceRange(variants: ProductVariantInventoryRes[]) {
  if (!variants.length) return "-";

  const source = getActiveVariants(variants);
  const prices = source.map((variant) => variant.storePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? formatCurrency(min)
    : `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function getTotalProductStock(variants: ProductVariantInventoryRes[]) {
  return variants.reduce((sum, variant) => sum + (variant.remainingQty || 0), 0);
}

export function getProductStatusFromVariants(variants: ProductVariantInventoryRes[]) {
  const totalStock = getTotalProductStock(variants);
  if (totalStock <= 0) return "Hết hàng";
  if (totalStock <= 10) return "Sắp hết";
  return "Còn hàng";
}