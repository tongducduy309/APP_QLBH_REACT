import { LineKind } from "./sales.types";

export type ProductType = "A" | "B" | "C" | "D";
export type PriceMode = "A" | "B" | "C"; // A: retail, B: store, C: custom

export type InventoryProduct = {
  id?: number | null;
  variantId?: number | null;
  name?: string;
  variantCode?: string;
  baseUnit?: string;
  retailPrice?: number;
  storePrice?: number;
  cost?: number;
};

export type OrderedProduct = {
  kind: LineKind;
  name: string;
  unit: string;
  price: number;
  length: number | null;
  quantity: number;
  productId: number | null;
  variantId?: number | null;
  inventoryId?: number | null;
};

export type CurvingOptions = {
  enabled: boolean;
  price: number;
  description: string;
};

export type FlatSheetOptions = {
  hasGroove: boolean;
  panelCount: number;
  width: number;
  panelSizes: number[];
};

export type OrderProductForm = {
  type: ProductType;
  curving: CurvingOptions;
  flatSheet: FlatSheetOptions;
  price: number;
  quantity: number;
  length: number;
};

export type OrderProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Partial<InventoryProduct>;
  onOrder: (order: OrderedProduct) => void;
};

