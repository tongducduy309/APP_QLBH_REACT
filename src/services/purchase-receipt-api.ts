import apiClient from "@/lib/api-client";
import type {
  PurchaseReceiptCreateReq,
  PurchaseReceiptDetailRes,
  PurchaseReceiptRes,
} from "@/features/purchase-receipts/types/purchase-receipt.types";

export async function getPurchaseReceipts(): Promise<PurchaseReceiptRes[]> {
  const { data } = await apiClient.get("/purchase-receipts");
  return data.data as PurchaseReceiptRes[];
}

export async function getPurchaseReceiptDetail(
  id: number | string,
): Promise<PurchaseReceiptDetailRes> {
  const { data } = await apiClient.get(`/purchase-receipts/${id}`);
  return data.data as PurchaseReceiptDetailRes;
}

export async function createPurchaseReceipt(
  payload: PurchaseReceiptCreateReq,
): Promise<PurchaseReceiptRes> {
  const { data } = await apiClient.post("/purchase-receipts", payload);
  return data.data as PurchaseReceiptRes;
}

export async function deletePurchaseReceipt(
  id: number,
): Promise<void> {
  await apiClient.delete(`/purchase-receipts/${id}`);
}