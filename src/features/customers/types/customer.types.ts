// src/modules/customers/types/customer.types.ts
export interface CustomerRes {
  id?: string;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
  point?: number;
  debt?: number;
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
  id?: string;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
}