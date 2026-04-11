import { InventoryExportColumnOption } from "../types/inventory.types";

export const INVENTORY_EXPORT_COLUMNS: InventoryExportColumnOption[] = [
  { key: "productName", label: "Tên sản phẩm" },
  { key: "categoryName", label: "Danh mục" },
  { key: "baseUnit", label: "Đơn vị cơ bản" },
  { key: "productActive", label: "Sản phẩm đang bán" },
  { key: "description", label: "Mô tả" },
  { key: "sku", label: "SKU" },
  { key: "variantCode", label: "Mã biến thể" },
  { key: "weight", label: "Trọng lượng" },
  { key: "retailPrice", label: "Giá bán lẻ" },
  { key: "storePrice", label: "Giá bán buôn" },
  { key: "variantActive", label: "Biến thể đang bán" },
  { key: "lotCode", label: "Mã lô" },
  { key: "originalQty", label: "SL ban đầu" },
  { key: "remainingQty", label: "SL tồn" },
  { key: "costPrice", label: "Giá vốn" },
  { key: "outOfStock", label: "Hết hàng" },
];

export const DEFAULT_INVENTORY_EXPORT_COLUMNS = [
  "productName",
  "categoryName",
  "baseUnit",
  "sku",
  "variantCode",
  "weight",
  "retailPrice",
  "storePrice",
  "lotCode",
  "remainingQty",
  "costPrice",
] as const;