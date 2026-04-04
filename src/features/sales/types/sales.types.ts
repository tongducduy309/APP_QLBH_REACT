// src/modules/sales/types/sales.types.ts

import type { OrderedProduct } from "../types/order-product.types";

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: "Còn hàng" | "Sắp hết" | "Hết hàng";
  retailPrice?: number;
  storePrice?: number;
  cost?: number;
  baseUnit?: string;
  variantId?: number | null;
  variantCode?: string;
};

export type CustomerOrderInfo = {
  customerId?: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderCode: string;
  createdDate: string;
  note: string;
  saveAsNewCustomer?: boolean;
};

export type OtherExpenseDraft = {
  description: string;
  quantity: number;
  length: number;
  price: number;
  unit: string;
};

export type LineKind = "inventory" | "expense" | "non_inventory";

export const LINE_KIND_LABEL: Record<LineKind, string> = {
  inventory: "Hàng trong kho",
  non_inventory: "Hàng ngoài kho",
  expense: "Chi phí khác",
};

export type CartLineItem = {
  rowId: string;
  kind: LineKind;
  name: string;
  unit?: string;
  quantity: number;
  length: number;
  price: number;
  lineTotal: number;
  productId?: number | null;
  variantId?: number | null;
  inventoryId?: number | null;
};

export type DisplayInventoryGroup = {
  groupKey: string;
  displayType: "inventory";
  name: string;
  unit?: string;
  price: number;
  productId?: number | null;
  variantId?: number | null;
  sizeLines: Array<{
    rowId: string;
    length: number;
    quantity: number;
    lineTotal: number;
  }>;
  totalQuantity: number;
  totalAmount: number;
};

export type DisplayNonInventoryGroup = {
  groupKey: string;
  displayType: "non_inventory";
  name: string;
  unit?: string;
  price: number;
  productId?: number | null;
  variantId?: number | null;
  sizeLines: Array<{
    rowId: string;
    length: number;
    quantity: number;
    lineTotal: number;
  }>;
  totalQuantity: number;
  totalAmount: number;
};

export type DisplayExpenseLine = CartLineItem & {
  displayType: "expense";
};

export type EditableOrderedGroup = {
  name: string;
  unit: string;
  price: number;
  productId: number | null;
  variantId?: number | null;
  sizeLines: Array<{
    length: number;
    quantity: number;
  }>;
};

export type SalesSummary = {
  productSubtotal: number;
  otherExpenseSubtotal: number;
  subTotalBeforeTax: number;
  taxAmount: number;
  grandTotal: number;
  remainingAmount: number;
  changeAmount: number;
};

export type HandleOrderSubmit = (orders: OrderedProduct[]) => void;

export interface OrderDetailCreateReq {
  productVariantId?: number | null;  
  name?: string;  
  length?: number;     
  quantity?: number;   
  price?: number;
  baseUnit?:string;
  inventoryId?: number | null;
}
export interface OrderCreateReq {
  customerId?: number|null; 
  nameCustomer?: string;
  phoneCustomer?: string;
  addressCustomer?: string;
  tax?: number|null;      
  note?: string;                
  paidAmount: number;         
  shippingFee: number;         
  orderDetailCreateReqs: OrderDetailCreateReq[]; 
  createdAt:string;
}