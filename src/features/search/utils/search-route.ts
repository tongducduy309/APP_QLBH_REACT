import { SearchSuggestion } from "@/types/search";


export function resolveSearchItemRoute(item: SearchSuggestion) {
  switch (item.entityType) {
    case "ORDER":
      return `/transactions/order/${item.entityId}`;

    case "BANK_TRANSFER":
      return `/transactions/bank-transfer/${item.entityId}`;

    case "PRODUCT":
      return `/inventory/${item.entityId}`;

    case "CUSTOMER":
      return `/customers/${item.entityId}`;

    case "PURCHASE_RECEIPT":
      return `/purchase-receipts/${item.entityId}`;

    case "EMPLOYEE":
      return `/employees/${item.entityId}`;

    default:
      return "/";
  }
}