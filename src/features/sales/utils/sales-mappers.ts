// src/modules/sales/utils/sales-mappers.ts

import { ProductInventoryRes } from "@/features/inventory/types/inventory.types";
import type { OrderedProduct } from "../types/order-product.types";
import type { CartLineItem, Product } from "../types/sales.types";
import { calculateLineTotal, toNumber } from "./sales-calculations";

export const mapOrderedProductsToCartLines = (
  orders: OrderedProduct[],
  fallbackUnit = "mét"
): CartLineItem[] => {
  return orders.map((order) => {
    const quantity = toNumber(order.quantity);
    const length = toNumber(order.length);
    const price = toNumber(order.price);

    return {
      rowId: `${Date.now()}-${Math.random()}`,
      kind: order.kind,
      name: order.name,
      unit: order.unit || fallbackUnit,
      quantity,
      length,
      price,
      productId: order.productId,
      variantId: order.variantId ?? null,
      inventoryId: order.inventoryId ?? null,
      lineTotal: calculateLineTotal({ quantity, length, price }),
    };
  });
};

export const mapExpenseToCartLine = ({
  description,
  quantity,
  length,
  price,
  unit,
}: {
  description: string;
  quantity: number;
  length: number;
  price: number;
  unit: string;
}): CartLineItem => ({
  rowId: `${Date.now()}-${Math.random()}`,
  kind: "expense",
  name: description,
  unit: unit || "-",
  quantity,
  length,
  price,
  lineTotal: calculateLineTotal({ quantity, length, price }),
});

function getStatusFromQty(qty: number): Product["status"] {
  if (qty <= 0) return "Hết hàng";
  if (qty <= 10) return "Sắp hết";
  return "Còn hàng";
}

export function mapInventoryProductsToSalesProducts(
  items: ProductInventoryRes[]
): Product[] {
  return items.flatMap((product) => {
    const variants = product.variants ?? [];

    if (variants.length === 0) {
      return [
        {
          id: product.id,
          sku: product.sku ?? "",
          name: product.name ?? "",
          category: product.categoryName ?? "",
          stock: Number(product.stock ?? 0),
          price: 0,
          retailPrice: 0,
          storePrice: 0,
          cost: 0,
          baseUnit: product.baseUnit ?? "mét",
          status: getStatusFromQty(Number(product.stock ?? 0)),
          variantId: null,
          variantCode: "",
          inventoryId: null,
        },
      ];
    }

    return variants.map((variant) => ({
      id: product.id,
      sku: variant.sku ?? product.sku ?? "",
      name: product.name ?? "",
      category: product.categoryName ?? "",
      stock: Number(variant.remainingQty ?? 0),
      price: Number(variant.retailPrice ?? 0),
      retailPrice: Number(variant.retailPrice ?? 0),
      storePrice: Number(variant.storePrice ?? 0),
      cost: Number(variant.costPrice ?? 0),
      baseUnit: product.baseUnit ?? "mét",
      status: getStatusFromQty(Number(variant.remainingQty ?? 0)),
      variantId: variant.variantId ?? null,
      inventoryId: variant.inventoryId ?? null,
      variantCode: variant.variantCode ?? "",
    }));
  });
}