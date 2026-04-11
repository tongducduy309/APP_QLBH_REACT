import { apiClient } from "@/lib/api-client";
import type {
  InventoryExportReq,
  InventoryImportRes,
  ProductCreateReq,
  ProductInventoryRes,
  ProductUpdateReq,
} from "@/features/inventory/types/inventory.types";
import { PurchaseReceiptRes } from "@/features/purchase-receipts/types/purchase-receipt.types";
import { ProductVariantRes } from "@/types/product";



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

export async function getAllProductVariants(): Promise<ProductVariantRes[]> {
  const { data } = await apiClient.get(`/product-variants`);
  return (data?.data ?? []) as ProductVariantRes[];
}

export async function exportInventoryExcel(payload: InventoryExportReq): Promise<Blob> {
  const { data } = await apiClient.post("/inventory/excel/export", payload, {
    responseType: "blob",
  });
  return data as Blob;
}

export async function importInventoryExcel(file: File): Promise<InventoryImportRes> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/inventory/excel/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data as InventoryImportRes;
}