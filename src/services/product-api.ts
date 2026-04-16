
import type {
  InventoryExportReq,
  InventoryImportRes,
  ProductCreateReq,
  ProductInventoryRes,
  ProductUpdateReq,
} from "@/features/inventory/types/inventory.types";
import { PurchaseReceiptRes } from "@/features/purchase-receipts/types/purchase-receipt.types";
import apiClient from "@/lib/api-client";
import { InventoryUpdateReq, ProductImportRes, ProductVariantRes } from "@/types/product";



export async function getAllInventory(): Promise<ProductInventoryRes[]> {
  const { data } = await apiClient.get("/inventory");
  return data.data as ProductInventoryRes[];
}

export async function getSellableProductInventories(): Promise<ProductInventoryRes[]> {
  const { data } = await apiClient.get("/inventory");
  const products = data.data as ProductInventoryRes[];
  return products.map((product) => {
    return {
      ...product,
      variants: product.variants.filter((variant) => variant.active),
    };
  }).filter((product) => product.variants.length > 0&&product.active);
}

export async function getInventoryById(
  id: number
): Promise<ProductInventoryRes | null> {
  const items = await getAllInventory();
  return items.find((item) => Number(item.id) === Number(id)) ?? null;
}

export async function updateInventory(id:number, inventory: InventoryUpdateReq): Promise<void> {
  await apiClient.put(`/inventory/${id}`, inventory);
}

export async function deleteInventory(id:number): Promise<void> {
  await apiClient.delete(`/inventory/${id}`);
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

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
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

export async function importProductExcelApi(file: File): Promise<ProductImportRes> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post("/products/excel/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
}