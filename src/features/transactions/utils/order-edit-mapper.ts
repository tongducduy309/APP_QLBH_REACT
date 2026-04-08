// src/features/transactions/utils/order-edit-mapper.ts

import type { CartLineItem, CustomerOrderInfo } from "@/features/sales/types/sales.types";
import type { OrderRes } from "@/types/order";
import { toISOStringFromVNDate } from "@/utils/date";

export function mapOrderDetailsToCartItems(order: OrderRes): CartLineItem[] {
  return (order.details ?? []).map((detail) => {
    const quantity = Number(detail.quantity ?? 0);
    const length = Number(detail.length ?? 0);
    const price = Number(detail.price ?? 0);

    return {
      rowId: `detail-${detail.id}`,
      detailId: detail.id ?? null,
      kind: detail.kind,
      name: detail.name ?? "",
      unit: detail.baseUnit ?? "",
      quantity,
      length,
      price,
      productId: null,
      variantId: detail.productVariantId ?? null,
      inventoryId: detail.inventoryId ?? null,
      lineTotal: price * quantity * (length || 1),
    };
  });
}

export function mapOrderToCustomerOrderInfo(order: OrderRes): Partial<CustomerOrderInfo> {
  return {
    customerId: order.customer?.id ?? null,
    customerName: order.customer?.name ?? "",
    customerPhone: order.customer?.phone ?? "",
    customerAddress: order.customer?.address ?? "",
    orderCode: order.code ?? "",
    createdDate: toISOStringFromVNDate(order.createdAt),
    note: order.note ?? "",
    saveAsNewCustomer: false,
  };
}