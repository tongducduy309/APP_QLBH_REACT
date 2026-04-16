import { InventoryRes } from "@/features/sales/components/order-product-dialog";

export interface ProductVariant {
  id?: number;
  variantCode?: string;
  weight?: number|null;
  retailPrice?: number|null;
  storePrice?: number|null;
  status?: boolean;
  inventories?:InventoryRes[];
}

export interface ProductVariantRes {
  id?: number;
  variantCode?: string;
  sku?: string;
  weight?: string|null;
  retailPrice?: number|null;
  storePrice?: number|null;
  status?: boolean;
  inventories?:InventoryRes[];
  productName?: string;
}

export interface InventoryUpdateReq {
  remainingQty: number;
  costPrice: number;
  inventoryCode?:string;
}

export type ProductImportRes = {
  totalRows: number;
  createdProducts: number;
  updatedProducts: number;
  createdVariants: number;
  updatedVariants: number;
  skippedRows: number;
  errors: string[];
};
