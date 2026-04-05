import type { OrderRes, OrderDetailRes } from "@/features/orders/types/order.types";
import type { SalesOrderDraft } from "../hooks/useSalesOrder";

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
  const details: OrderDetailRes[] = draft.cartItems.map((item, index) => ({
    id: index + 1,
    length: item.length,
    quantity: item.quantity,
    price: item.price,
    totalQuantity: item.length > 0 ? item.length * item.quantity : item.quantity,
    inventoryId: item.inventoryId ?? null,
    sku: "",
    name: item.name,
    productVariant: {} as any,
    baseUnit: item.unit ?? "",
    index,
  }));

  return {
    id: draft.id,
    code: draft.customerOrderInfo.orderCode || draft.id,
    customer: {
      id: draft.customerOrderInfo.customerId ?? 0,
      name: draft.customerOrderInfo.customerName,
      phone: draft.customerOrderInfo.customerPhone,
      address: draft.customerOrderInfo.customerAddress,
    } as any,
    note: draft.customerOrderInfo.note,
    tax: draft.taxPercent,
    taxAmount: computed.taxAmount,
    paidAmount: draft.paidAmount,
    remainingAmount: computed.remainingAmount,
    shippingFee: draft.shippingFee,
    subtotal: computed.subtotal,
    paidDept: 0,
    changeAmount: computed.changeAmount,
    total: computed.total,
    details,
    createdAt: draft.customerOrderInfo.createdDate || draft.createdAt,
  };
};