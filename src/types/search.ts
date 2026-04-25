export type SearchEntityType =
  | "ORDER"
  | "PRODUCT"
  | "CUSTOMER"
  | "PURCHASE_RECEIPT"
  | "EMPLOYEE";

export type SearchSuggestion = {
  entityId: string;
  entityType: SearchEntityType;
  entityLabel: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
};