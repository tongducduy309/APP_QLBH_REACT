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