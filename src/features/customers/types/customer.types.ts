// src/modules/customers/types/customer.types.ts
export interface CustomerRes {
  id?: number;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
  point?: number;
  totalDebt?: number;
  createdAt?: string;
}

export interface CustomerCreateReq {
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
}

export interface CustomerUpdateReq {
  id?:number;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
}