// src/modules/inventory/utils/inventory.mappers.ts


import type {
    ProductCreateReq,
  ProductForm,
  ProductInventoryRes,
  ProductUpdateReq,
  ProductVariantInventoryRes,
} from "../types/inventory.types";
import {
  createInitialVariant,
  getProductStatusFromVariants,
  getTotalProductStock,
} from "./inventory.helpers";


export function mapProductToForm(product: ProductInventoryRes): ProductForm {
  const variants: ProductVariantInventoryRes[] =
    product.variants && product.variants.length > 0
      ? product.variants.map((variant) => ({
          inventoryId: variant.inventoryId ?? null,
          sku: variant.sku ?? "",
          lotCode: variant.lotCode ?? "",
          originalQty: Number(variant.originalQty ?? 0),
          outOfStock: Boolean(variant.outOfStock),
          variantId: variant.variantId ?? null,
          variantCode: variant.variantCode ?? "",
          weight: variant.weight ?? "",
          retailPrice: Number(variant.retailPrice ?? 0),
          storePrice: Number(variant.storePrice ?? 0),
          remainingQty: Number(variant.remainingQty ?? 0),
          costPrice: Number(variant.costPrice ?? 0),
          active: Boolean(variant.active),
        }))
      : [createInitialVariant()];

  return {
    sku: product.sku ?? "",
    name: product.name ?? "",
    categoryName: product.categoryName ?? "",
    baseUnit: product.baseUnit ?? "mét",
    stock: Number(product.stock ?? 0),
    description: product.description ?? "",
    active: Boolean(product.active),
    variants,
  };
}

export function buildProductRowFromForm(
  form: ProductForm,
  id: number
): ProductInventoryRes {
  const sourceVariants: ProductVariantInventoryRes[] =
    form.variants.length > 0 ? form.variants : [createInitialVariant()];

  const totalStock = getTotalProductStock(sourceVariants);

  return {
    id,
    sku: form.sku.trim(),
    name: form.name.trim(),
    categoryName: form.categoryName.trim(),
    stock: totalStock,
    status: getProductStatusFromVariants(sourceVariants),
    active: form.active,
    baseUnit: form.baseUnit.trim() || "mét",
    description: form.description.trim(),
    variants: sourceVariants.map((variant) => ({
      ...variant,
      remainingQty: Number(variant.remainingQty ?? 0),
      costPrice: Number(variant.costPrice ?? 0),
      retailPrice: Number(variant.retailPrice ?? 0),
      storePrice: Number(variant.storePrice ?? 0),
      weight: variant.weight ?? "",
      originalQty: Number(variant.originalQty ?? 0),
      outOfStock: Number(variant.remainingQty ?? 0) <= 0,
    })),
  };
}

export function mapProductFormToCreateReq(
  form: ProductForm
): ProductCreateReq {
  return {
    name: form.name?.trim(),
    categoryName: form.categoryName?.trim(),
    baseUnit: form.baseUnit?.trim(),
    active: form.active,
    description: form.description?.trim(),
    variants: form.variants?.map((variant) => ({
      variantCode: variant.variantCode?.trim(),
      sku: variant.sku?.trim(),
      weight: variant.weight ?? 0,
      retailPrice: variant.retailPrice ?? 0,
      storePrice: variant.storePrice ?? 0,
      active: variant.active ?? true,
    })),
  };
}

export function mapProductFormToUpdateReq(
  form: ProductForm,
  productId: number
): ProductUpdateReq {
  return {
    id: productId,
    name: form.name?.trim(),
    categoryName: form.categoryName?.trim(),
    baseUnit: form.baseUnit?.trim(),
    active: form.active,
    description: form.description?.trim(),
    variants: form.variants?.map((variant) => ({
      id: variant.variantId ?? null,
      variantCode: variant.variantCode?.trim(),
      sku: variant.sku?.trim(),
      weight: variant.weight ?? 0,
      retailPrice: variant.retailPrice ?? 0,
      storePrice: variant.storePrice ?? 0,
      active: variant.active ?? true,
    })),
  };
}