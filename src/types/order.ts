export interface OrderReq {
  code?: string;
  customerId?: number | null;
  orderDetails?: unknown[];
  note?: string;
};

export interface PaidDeptReq {
  orderId: string;
  amount: number;
};

export interface OrderRes {
  id: string;
  code: string;
  customerId?: number | null;
  totalAmount?: number;
  note?: string;
};

export interface ResponseEntity<T = unknown> {
  status: number;
  message: string;
  data: T;
};