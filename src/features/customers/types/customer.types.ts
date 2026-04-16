export interface CustomerRes {
  id: number | null;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
  point?: number;
  totalDebt?: number;
  createdAt?: string;
}

export interface CustomerDetailRes {
  id?: number;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
  createdAt?: string;
  totalDebt?: number;
}

export interface CustomerCreateReq {
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
}

export interface CustomerUpdateReq {
  id?: number;
  name?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  email?: string;
}