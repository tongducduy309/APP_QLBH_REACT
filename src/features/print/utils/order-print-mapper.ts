import { SalesOrderDraft } from "@/features/sales/hooks/useSalesOrder";
import { OrderDetailRes, OrderRes, OrderStatus } from "@/types/order";

export const mapSalesDraftToOrderRes = (
  draft: SalesOrderDraft,
  computed: {
    taxAmount: number;
    remainingAmount: number;
    changeAmount: number;
    subtotal: number;
    total: number;
  }
): OrderRes => {
  const details: OrderDetailRes[] = draft.cartItems.map((item: any, index: number) => ({
    id: item.detailId ?? index + 1,
    length: Number(item.length ?? 0),
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0),
    totalQuantity:
      Number(item.totalQuantity ?? 0) ||
      (Number(item.length ?? 0) > 0
        ? Number(item.length ?? 0) * Number(item.quantity ?? 0)
        : Number(item.quantity ?? 0)),
    inventoryId: item.inventoryId ?? null,
    sku: item.sku ?? "",
    kind: item.kind,
    name: item.name ?? "",
    productVariantId: item.variantId ?? null,
    baseUnit: item.unit ?? "",
    index,
  }));

  return {
    id: draft.id,
    code: draft.customerOrderInfo.orderCode || draft.id.toString(),
    customer: {
      id: draft.customerOrderInfo.customerId ?? 0,
      name: draft.customerOrderInfo.customerName ?? "",
      phone: draft.customerOrderInfo.customerPhone ?? "",
      address: draft.customerOrderInfo.customerAddress ?? "",
    } as any,
    note: draft.customerOrderInfo.note ?? "",
    tax: Number(draft.taxPercent ?? 0),
    taxAmount: Number(computed.taxAmount ?? 0),
    paidAmount: Number(draft.paidAmount ?? 0),
    remainingAmount: Number(computed.remainingAmount ?? 0),
    shippingFee: Number(draft.shippingFee ?? 0),
    subtotal: Number(computed.subtotal ?? 0),
    paidDept: 0,
    changeAmount: Number(computed.changeAmount ?? 0),
    total: Number(computed.total ?? 0),
    details,
    status: OrderStatus.CONFIRMED,
    createdAt: draft.customerOrderInfo.createdDate || draft.createdAt,
  };
};

