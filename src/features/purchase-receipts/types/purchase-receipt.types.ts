export type PurchaseReceiptMethod =
  | "ADDITIVE"
  | "SEPARATE";

export interface PurchaseReceiptCreateReq {
  productVariantId?: number;
  purchaseReceiptMethod?: PurchaseReceiptMethod;
  totalQuantity?: number;
  cost?: number;
  supplier?: string;
  note?: string;
}

export interface PurchaseReceiptRes {
  id?: number;
  productVariantCode?: string;
  productVariantSKU?: string;
  productId?: number;
  name?: string;
  purchaseReceiptMethod?: PurchaseReceiptMethod;
  totalQuantity?: number;
  cost?: number;
  supplier?: string;
  note?: string;
  createdAt?: string;
}

export interface PurchaseReceiptForm {
  productVariantId: number | null;
  purchaseReceiptMethod: PurchaseReceiptMethod;
  totalQuantity: number;
  cost: number;
  supplier: string;
  note: string;
}