export type SearchEntityType =
  | "ORDER"
  | "PRODUCT"
  | "CUSTOMER"
  | "PURCHASE_RECEIPT"
  | "BANK_TRANSFER"
  | "EMPLOYEE";

export type SearchSuggestion = {
  entityId: string;
  entityType: SearchEntityType;
  entityLabel: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
};