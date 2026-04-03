// src/modules/sales/utils/sales-mappers.ts

import type { OrderedProduct } from "../types/order-product.types";
import type { CartLineItem } from "../types/sales.types";
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
      kind: "product",
      name: order.name,
      unit: order.unit || fallbackUnit,
      quantity,
      length,
      price,
      productId: order.productId,
      variantId: order.variantId ?? null,
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