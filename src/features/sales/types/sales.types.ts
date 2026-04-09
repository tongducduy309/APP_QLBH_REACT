// src/features/sales/types/sales.types.ts

import { OrderStatus } from "@/types/order";

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
  inventoryId?: number | null;
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

export type LineKind = "INVENTORY" | "EXPENSE" | "NON_INVENTORY";

export const LINE_KIND_LABEL: Record<LineKind, string> = {
  INVENTORY: "Hàng trong kho",
  NON_INVENTORY: "Hàng ngoài kho",
  EXPENSE: "Chi phí khác",
};

export type CartLineItem = {
  rowId: string;
  detailId?: number | null;
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

export type DisplayInventoryGroup = CartLineItem & {
  groupKey: string;
  displayType: "INVENTORY";
  sizeLines: Array<{
    rowId: string;
    length: number;
    quantity: number;
    lineTotal: number;
  }>;
  totalQuantity: number;
  totalAmount: number;
};

export type DisplayNonInventoryGroup = CartLineItem & {
  groupKey: string;
  displayType: "NON_INVENTORY";
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
  displayType: "EXPENSE";
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

export interface OrderDetailCreateReq {
  productVariantId?: number | null;
  name?: string;
  length?: number;
  quantity?: number;
  price?: number;
  baseUnit?: string;
  inventoryId?: number | null;
  kind: LineKind;
}

export interface OrderCreateReq {
  customerId?: number | null;
  nameCustomer?: string;
  phoneCustomer?: string;
  addressCustomer?: string;
  tax?: number | null;
  note?: string;
  paidAmount: number;
  shippingFee: number;
  orderDetailCreateReqs: OrderDetailCreateReq[];
  createdAt: string;
  status: OrderStatus;
}