import { CustomerRes } from "@/features/customers/types/customer.types";
import { LineKind } from "@/features/sales/types/sales.types";

export enum OrderStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
}

export interface OrderDetailRes {
  id: number;       
  length: number | null;     
  quantity: number | null;   
  price:number;
  totalQuantity:number | null;
  inventoryId: number | null;
  weight:string;
  sku: string;
  name: string;
  kind:LineKind;
  productVariantId: number | null;
  baseUnit: string;
  index:number|null;
}

export interface OrderRes {
  id: number;                 
  code: string;                 
  customer: CustomerRes | null; 
  note?: string;
  tax?: number;    
  taxAmount?: number;
  paidAmount: number;
  remainingAmount: number;
  shippingFee: number;
  subtotal: number;
  paidDept: number;
  changeAmount: number;
  total:number;
  details: OrderDetailRes[];    
  createdAt: string;
  status: OrderStatus;
}

export interface OrderRecentRes {
  id: string;                 
  code: string;                 
  customerName?: string | null; 
  createdAt: string;
  total:number;
}

export interface OrderDetailUpdateReq {
  id?: number | null;
  kind?: LineKind;
  productVariantId?: number | null;  
  name?: string;  
  length?: number;     
  quantity?: number;   
  price?: number;
  baseUnit?:string;
  inventoryId?: number | null;
}
export interface OrderUpdateReq {
  customerId?: number|null; 
  nameCustomer?: string;
  phoneCustomer?: string;
  addressCustomer?: string;
  tax?: number|null;      
  note?: string;                
  paidAmount: number;         
  shippingFee: number;         
  orderDetailUpdateReqs: OrderDetailUpdateReq[]; 
  createdAt:string;
  status: OrderStatus;
}

export type PayOrderReq = {
  orderId:number;
  amount: number;
};

export type SendInvoiceEmailReq = {
  orderId: number;
  to: string;
  subject?: string;
  content?: string;
  pdfBlob: Blob;
  fileName?: string;
};