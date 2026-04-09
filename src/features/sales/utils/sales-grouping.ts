// src/modules/sales/utils/sales-grouping.ts

import type {
  CartLineItem,
  DisplayExpenseLine,
  DisplayInventoryGroup,
  DisplayNonInventoryGroup,
} from "../types/sales.types";

export const buildProductGroupKey = (item: CartLineItem) =>
  [
    item.kind,
    item.productId ?? "",
    item.variantId ?? "",
    item.name.trim().toLowerCase(),
    item.unit ?? "",
    item.price,
    item.inventoryId ?? ""
  ].join("|");

export const groupProductItems = (
  productItems: CartLineItem[]
): (DisplayInventoryGroup | DisplayNonInventoryGroup)[] => {
  const groups = new Map<string, DisplayInventoryGroup | DisplayNonInventoryGroup>();

  for (const item of productItems) {
    const groupKey = buildProductGroupKey(item);

    if (!groups.has(groupKey)) {
      const displayType = item.kind === "NON_INVENTORY" ? "NON_INVENTORY" : "INVENTORY";
      groups.set(groupKey, {
        groupKey,
        displayType,
        name: item.name,
        unit: item.unit,
        price: item.price,
        productId: item.productId,
        variantId: item.variantId,
        inventoryId: item.inventoryId,
        sizeLines: [],
        totalQuantity: 0,
        totalAmount: 0,
      } as unknown as DisplayInventoryGroup | DisplayNonInventoryGroup);
    }

    const current = groups.get(groupKey)!;
    current.sizeLines.push({
      rowId: item.rowId,
      length: item.length,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    });
    current.totalQuantity += item.quantity;
    current.totalAmount += item.lineTotal;
  }

  return Array.from(groups.values());
};

export const buildOrderedDisplayItems = (
  groupedProductItems: (DisplayInventoryGroup | DisplayNonInventoryGroup)[],
  expenseItems: CartLineItem[]
) => {
  return [
    ...groupedProductItems,
    ...expenseItems.map(
      (item) =>
        ({
          ...item,
          displayType: "EXPENSE" as const,
        }) satisfies DisplayExpenseLine
    ),
  ];
};