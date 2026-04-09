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
  totalCost?: number;
  lotCode?:string;
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
  totalCost?: number;
}

export interface PurchaseReceiptForm {
  productVariantId: number | null;
  totalQuantity: number;
  cost: number;
  supplier: string;
  note: string;
  totalCost?: number;
  lotCode?:string;
}

export interface PurchaseReceiptDetailRes {
  id?: number;

  productId?: number;
  productName?: string;

  productVariantId?: number;
  productVariantCode?: string;
  productVariantSKU?: string;
  productVariantWeight?: string;

  purchaseReceiptMethod?: PurchaseReceiptMethod;

  totalQuantity?: number;
  cost?: number;
  totalCost?: number;
  supplier?: string;
  note?: string;
  createdAt?: string;

  inventoryLotId?: number;
  inventoryLotCode?: string;
  inventoryOriginalQty?: number;
  inventoryRemainingQty?: number;
  inventoryCostPrice?: number;
  inventoryImportedAt?: string;
  inventoryActive?: boolean;
}