import { apiClient } from "@/lib/api-client";
import type { ProductCreateReq, ProductInventoryRes, ProductUpdateReq } from "@/features/inventory/types/inventory.types";

export async function getAllInventory(): Promise<ProductInventoryRes[]> {
  const { data } = await apiClient.get("/inventory?status=true");
  return data.data as ProductInventoryRes[];
}

export async function createProduct(product: ProductCreateReq): Promise<void> {
  await apiClient.post("/products", product);
}

export async function updateProduct(id: number, product: ProductUpdateReq): Promise<void> {
  await apiClient.put(`/products/${id}`, product);
}