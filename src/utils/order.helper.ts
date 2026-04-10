import { LineKind } from "@/features/sales/types/sales.types";
import { OrderDetailRes, OrderRes } from "@/types/order";
export function sortOrderResDetails(order: OrderRes): OrderRes {
  return {
    ...order,
    details: sortOrderDetailsByKind(order.details),
  };
}
export function sortOrderDetailsByKind(details: OrderDetailRes[]) {
  const order: Record<LineKind, number> = {
    INVENTORY: 1,
    NON_INVENTORY: 2,
    EXPENSE: 3,
  };

  return [...details].sort((a, b) => {
    return order[a.kind] - order[b.kind];
  });
}