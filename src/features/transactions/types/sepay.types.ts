export type SepayTransferType = "in" | "out";
export type SepayWebhookStatus = 0 | 1;

export interface SepayTransaction {
  id: string;
  transaction_date: string;
  bank_brand_name?: string | null;
  account_number?: string | null;
  transfer_type?: SepayTransferType;
  amount_in?: number;
  amount_out?: number;
  reference_number?: string | null;
  transaction_content?: string | null;
  va?: string | null;
  va_id?: string | number | null;
  bank_account_id?: string | null;
  code?: string | null;
  webhook_success?: SepayWebhookStatus;
  accumulated?: number | null;
  [key: string]: any;
}

export interface SepayTransactionsResponse {
  data?: {
    data?: SepayTransaction[];
    [key: string]: any;
  };
  [key: string]: any;
}
