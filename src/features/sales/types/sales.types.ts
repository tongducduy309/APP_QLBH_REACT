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
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderCode: string;
  createdDate: string;
  note: string;
};

export type OtherExpenseDraft = {
  description: string;
  quantity: number;
  length: number;
  price: number;
  unit: string;
};

export type LineKind = "product" | "expense";

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
};

export type DisplayProductGroup = {
  groupKey: string;
  displayType: "product";
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