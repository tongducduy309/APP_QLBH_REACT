export interface ProductVariantInventoryRes {
  inventoryId: number | null;
  productName?: string;
  sku: string;
  lotCode: string;
  originalQty: number;
  outOfStock: boolean;
  variantId: number | null;
  variantCode: string;
  weight: string;
  retailPrice: number;
  storePrice: number;
  remainingQty: number;
  costPrice: number;
  active: boolean;
}

export interface ProductInventoryRes {
  id: number;
  sku: string;
  name: string;
  categoryName: string;
  baseUnit: string;
  description: string;
  active: boolean;
  stock: number;
  status: string;
  variants: ProductVariantInventoryRes[];
}

// export interface ProductVariantForm {
//   id: string;
//   inventoryId: number | null;
//   lotCode: string;
//   originalQty: number;
//   outOfStock: boolean;
//   variantId: number | null;
//   variantCode: string;
//   weight: string;
//   retailPrice: number;
//   storePrice: number;
//   remainingQty: number;
//   costPrice: number;
//   active: boolean;
// }

export interface ProductForm {
  sku: string;
  name: string;
  categoryName: string;
  baseUnit: string;
  stock: number;
  description: string;
  active: boolean;
  variants: ProductVariantInventoryRes[];
}


export interface InventoryEditForm {
  remainingQty: number;
  costPrice: number;
  active: boolean;
}

export interface ProductCreateReq{
  name?:string;
  categoryName?:string;
  baseUnit?:string;
  active?:boolean;
  variants?:ProductVariantCreateReq[];
  description?:string;
}

export interface ProductVariantCreateReq {
  variantCode?: string;
  sku?: string;
  weight?: string|null;
  retailPrice?: number|null;
  storePrice?: number|null;
  
  active?: boolean;
}

export interface ProductUpdateReq{
  id?:number;
  name?:string;
  categoryName?:string;
  baseUnit?:string;
  description?:string;
  active?:boolean;
  variants?:ProductVariantUpdateReq[];
}

export interface ProductVariantUpdateReq {
  id?:number|null;
  variantCode?: string;
  sku?: string;
  weight?: string|null;
  retailPrice?: number|null;
  storePrice?: number|null;
  active?: boolean;
}