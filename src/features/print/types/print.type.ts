export type DataPdfProduct = {
  name: string;
  baseUnit: string;
  length: number;
  quantity: number;
  totalQuantity: number;
  price: number;
  subtotal: number;
};

export type DataPdf = {
  id: string;
  code: string;
  createdAt: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  } | null;
  products: DataPdfProduct[];
  subtotal: number;
  tax?: number;
  taxAmount?: number;
  shippingFee?: number;
  total: number;
  paidAmount?: number;
  remainingAmount: number;
  note?: string;
};