import { CustomerRes } from "@/features/customers/types/customer.types";
import { ProductVariant } from "./product";

export interface OrderDetailRes {
  id: number;       
  length: number;     
  quantity: number;   
  price:number;
  totalQuantity:number;
  inventoryId: number | null;
  sku: string;
  name: string;
  productVariant: ProductVariant; 
  baseUnit: string;
  index:number|null;
}

export interface OrderRes {
  id: string;                 
  code: string;                 
  customer?: CustomerRes | null; 
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
}

export interface OrderRecentRes {
  id: string;                 
  code: string;                 
  customerName?: string | null; 
  createdAt: string;
  total:number;
}