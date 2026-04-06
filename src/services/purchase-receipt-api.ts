import { apiClient } from "@/lib/api-client";
import type {
  PurchaseReceiptCreateReq,
  PurchaseReceiptRes,
} from "@/features/purchase-receipts/types/purchase-receipt.types";

export async function getPurchaseReceipts(): Promise<PurchaseReceiptRes[]> {
  const { data } = await apiClient.get("/purchase-receipts");
  return data.data as PurchaseReceiptRes[];
}

export async function createPurchaseReceipt(
  payload: PurchaseReceiptCreateReq,
): Promise<PurchaseReceiptRes> {
  const { data } = await apiClient.post("/purchase-receipts", payload);
  return data.data as PurchaseReceiptRes;
}