import { apiClient } from "@/lib/api-client";
import type {
  ProductCreateReq,
  ProductInventoryRes,
  ProductUpdateReq,
} from "@/features/inventory/types/inventory.types";
import { PurchaseReceiptRes } from "@/features/purchase-receipts/types/purchase-receipt.types";



export async function getAllInventory(): Promise<ProductInventoryRes[]> {
  const { data } = await apiClient.get("/inventory?status=true");
  return data.data as ProductInventoryRes[];
}

export async function getInventoryById(
  id: number
): Promise<ProductInventoryRes | null> {
  const items = await getAllInventory();
  return items.find((item) => Number(item.id) === Number(id)) ?? null;
}

export async function createProduct(product: ProductCreateReq): Promise<void> {
  await apiClient.post("/products", product);
}

export async function updateProduct(
  id: number,
  product: ProductUpdateReq
): Promise<void> {
  await apiClient.put(`/products/${id}`, product);
}

export async function getProductImportHistory(
  productId: number
): Promise<PurchaseReceiptRes[]> {
  const { data } = await apiClient.get(`/purchase-receipts/product/${productId}`);
  return (data?.data ?? []) as PurchaseReceiptRes[];
}
