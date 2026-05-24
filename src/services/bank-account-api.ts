import apiClient from "@/lib/api-client";
import type { BankAccount, BankAccountCreateReq } from "@/features/transactions/types/bank.types";

type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export async function getBankAccounts(): Promise<BankAccount[]> {
  const { data } = await apiClient.get<ApiResponse<BankAccount[]>>("/bank-accounts");
  return data.data;
}

export async function createBankAccount(
  payload: BankAccountCreateReq,
): Promise<BankAccount> {
  const { data } = await apiClient.post<ApiResponse<BankAccount>>(
    "/bank-accounts",
    payload,
  );
  return data.data;
}

export async function deleteBankAccount(id: string): Promise<void> {
  await apiClient.delete(`/bank-accounts/${encodeURIComponent(id)}`);
}

export async function setDefaultBankAccount(id: string): Promise<void> {
  await apiClient.put(`/bank-accounts/${encodeURIComponent(id)}/default`);
}
