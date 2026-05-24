
import { SepayTransaction, SepayTransactionsResponse } from "@/features/transactions/types/sepay.types";
import apiClient from "@/lib/api-client";




export async function getSepayTransactions(): Promise<SepayTransaction[]> {
  const { data } = await apiClient.get<SepayTransactionsResponse>(
    "/sepay/transactions/recent"
  );

  return data?.data?.data ?? [];
}

export async function getSepayTransactionDetails(
  transactionId: string
): Promise<SepayTransaction> {
  const { data } = await apiClient.get(
    `/sepay/transactions/${transactionId}`
  );
  return data.data as SepayTransaction;
}