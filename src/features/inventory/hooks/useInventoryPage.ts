import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  InventoryEditForm,
  InventoryExportColumnKey,
  ProductForm,
  ProductInventoryRes,
  ProductVariantInventoryRes,
} from "../types/inventory.types";


import {
  createInitialForm,
  createInitialVariant,
  getTotalProductStock,
} from "../utils/inventory.helpers";

import {
  mapProductFormToCreateReq,
  mapProductFormToUpdateReq,
  mapProductToForm,
} from "../utils/inventory.mappers";

import {
  validateInventoryEditForm,
  validateProductForm,
} from "../utils/inventory.validators";

import {
  createProduct,
  deleteInventory,
  exportInventoryExcel,
  getAllInventory,
  importProductExcelApi,
  updateInventory,
  updateProduct,
} from "@/services/product-api";

import { createPurchaseReceipt } from "@/services/purchase-receipt-api";

import type {
  PurchaseReceiptCreateReq,
  PurchaseReceiptForm,
} from "@/features/purchase-receipts/types/purchase-receipt.types";

import { DEFAULT_INVENTORY_EXPORT_COLUMNS } from "../constants/inventory-export-columns";
import type { InventoryUpdateReq, ProductImportRes } from "@/types/product";

function createInitialPurchaseReceiptForm(): PurchaseReceiptForm {
  return {
    productVariantId: null,
    totalQuantity: 0,
    cost: 0,
    supplier: "",
    note: "",
  };
}

export function useInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<ProductInventoryRes[]>([]);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedExportColumns, setSelectedExportColumns] =
    useState<InventoryExportColumnKey[]>([...DEFAULT_INVENTORY_EXPORT_COLUMNS]);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [importResult, setImportResult] = useState<ProductImportRes | null>(null);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(createInitialForm());

  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [editingParentProductId, setEditingParentProductId] = useState<number | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editingProductName, setEditingProductName] = useState("");

  const [inventoryEditForm, setInventoryEditForm] = useState<InventoryEditForm>({
    remainingQty: 0,
    costPrice: 0,
    inventoryCode: "",
  });

  const [isPurchaseReceiptDialogOpen, setIsPurchaseReceiptDialogOpen] = useState(false);
  const [purchaseReceiptVariantLabel, setPurchaseReceiptVariantLabel] = useState("");
  const [purchaseReceiptForm, setPurchaseReceiptForm] = useState<PurchaseReceiptForm>(
    createInitialPurchaseReceiptForm()
  );
  const [isSubmittingPurchaseReceipt, setIsSubmittingPurchaseReceipt] = useState(false);

  const isEditingProduct = editingProductId !== null;

  const totalProducts = useMemo(() => inventoryItems.length, [inventoryItems]);


  const totalVariantCount = useMemo(
    () => inventoryItems.reduce((sum, item) => sum + (item.variants?.length ?? 0), 0),
    [inventoryItems]
  );

  const lowStockCount = useMemo(
    () =>
      inventoryItems.filter((item) => {
        const totalStock = getTotalProductStock(item.variants ?? []);
        return totalStock > 0 && totalStock <= 10;
      }).length,
    [inventoryItems]
  );

  const outOfStockCount = useMemo(
    () =>
      inventoryItems.filter((item) => getTotalProductStock(item.variants ?? []) <= 0)
        .length,
    [inventoryItems]
  );

  const fetchInventory = async () => {
    try {
      const data = await getAllInventory();
      setInventoryItems(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Không thể tải danh sách hàng hóa.");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const resetForm = () => {
    setForm(createInitialForm());
    setEditingProductId(null);
  };

  const resetInventoryEditState = () => {
    setEditingParentProductId(null);
    setEditingVariantId(null);
    setEditingProductName("");
    setInventoryEditForm({
      remainingQty: 0,
      costPrice: 0,
      inventoryCode: "",
    });
  };

  const resetPurchaseReceiptState = () => {
    setPurchaseReceiptVariantLabel("");
    setPurchaseReceiptForm(createInitialPurchaseReceiptForm());
  };

  const openCreateDialog = () => {
    resetForm();
    setIsProductDialogOpen(true);
  };

  const openEditDialog = (product: ProductInventoryRes) => {
    setEditingProductId(product.id);
    setForm(mapProductToForm(product));
    setIsProductDialogOpen(true);
  };

  const openEditInventoryDialog = (
    parentProductId: number,
    variant: ProductVariantInventoryRes
  ) => {
    setEditingParentProductId(parentProductId);
    setEditingVariantId(variant.variantId);
    setEditingProductName(
      `${variant.productName} (${variant.variantCode}${variant.weight ? ` - ${variant.weight}` : ""})${variant.sku ? ` - ${variant.sku}` : ""}`
    );
    setInventoryEditForm({
      remainingQty: Number(variant.remainingQty ?? 0),
      costPrice: Number(variant.costPrice ?? 0),
      inventoryCode: variant.inventoryCode ?? "",
    });
    setIsInventoryDialogOpen(true);
  };

  const openPurchaseReceiptDialog = (
    _parentProductId: number,
    variant: ProductVariantInventoryRes,
    productName: string
  ) => {
    setPurchaseReceiptVariantLabel(
      `${productName}${variant.weight ? ` (${variant.weight})` : ""} - ${variant.variantCode || "Biến thể"}${variant.sku ? ` - ${variant.sku}` : ""}`
    );

    setPurchaseReceiptForm({
      productVariantId: variant.variantId ?? null,
      totalQuantity: 0,
      cost: Number(variant.costPrice ?? 0),
      supplier: "",
      note: "",
    });

    setIsPurchaseReceiptDialogOpen(true);
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createInitialVariant()],
    }));
  };

  const updateVariant = (
    variantIndex: number,
    nextVariant: ProductVariantInventoryRes
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, idx) =>
        idx === variantIndex ? nextVariant : variant
      ),
    }));
  };

  const removeVariant = (variantIndex: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== variantIndex),
    }));
  };

  const handleSubmit = async () => {
    const isValid = validateProductForm(form);
    if (!isValid) return;

    try {
      if (isEditingProduct && editingProductId !== null) {
        const productReq = mapProductFormToUpdateReq(form, editingProductId);
        await updateProduct(editingProductId, productReq);
        toast.success("Cập nhật sản phẩm thành công.");
      } else {
        const productReq = await mapProductFormToCreateReq(form);
        await createProduct(productReq);
        toast.success("Thêm mới sản phẩm thành công.");
      }

      setIsProductDialogOpen(false);
      resetForm();
      await fetchInventory();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditingProduct ? "Cập nhật sản phẩm thất bại." : "Thêm mới sản phẩm thất bại."
      );
    }
  };

  const handleSaveInventory = async () => {
    if (editingParentProductId === null || !editingVariantId) return;

    const isValid = validateInventoryEditForm(inventoryEditForm);
    if (!isValid) return;

    const inventoryUpdateReq: InventoryUpdateReq = {
      remainingQty: Number(inventoryEditForm.remainingQty ?? 0),
      costPrice: Number(inventoryEditForm.costPrice ?? 0),
      inventoryCode: inventoryEditForm.inventoryCode ?? "",
    };

    try {
      await updateInventory(editingVariantId, inventoryUpdateReq);
      toast.success("Cập nhật tồn kho biến thể thành công.");
      setIsInventoryDialogOpen(false);
      resetInventoryEditState();
      await fetchInventory();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật tồn kho biến thể thất bại.");
    }
  };

  const handleCreatePurchaseReceipt = async () => {
    if (!purchaseReceiptForm.productVariantId) {
      toast.info("Thiếu biến thể sản phẩm.");
      return;
    }

    if (Number(purchaseReceiptForm.totalQuantity ?? 0) <= 0) {
      toast.info("Số lượng nhập phải lớn hơn 0.");
      return;
    }

    if (Number(purchaseReceiptForm.cost ?? 0) < 0) {
      toast.info("Giá nhập không hợp lệ.");
      return;
    }

    const payload: PurchaseReceiptCreateReq = {
      productVariantId: Number(purchaseReceiptForm.productVariantId),
      purchaseReceiptMethod: "ADDITIVE",
      totalQuantity: Number(purchaseReceiptForm.totalQuantity),
      cost: Number(purchaseReceiptForm.cost),
      supplier: purchaseReceiptForm.supplier.trim() || undefined,
      note: purchaseReceiptForm.note.trim() || undefined,
    };

    try {
      setIsSubmittingPurchaseReceipt(true);
      await createPurchaseReceipt(payload);
      toast.success("Nhập hàng thành công.");
      setIsPurchaseReceiptDialogOpen(false);
      resetPurchaseReceiptState();
      await fetchInventory();
    } catch (error) {
      console.error("Create purchase receipt failed:", error);
      toast.error("Nhập hàng thất bại.");
    } finally {
      setIsSubmittingPurchaseReceipt(false);
    }
  };

  const openExportDialog = () => {
    setIsExportDialogOpen(true);
  };

  const openImportDialog = () => {
    setImportResult(null);
    setIsImportDialogOpen(true);
  };

  const handleExportExcel = async () => {
    if (selectedExportColumns.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 cột để xuất.");
      return;
    }

    try {
      setIsExportingExcel(true);

      const blob = await exportInventoryExcel({
        columns: selectedExportColumns,
        onlyActive: true,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hang-hoa-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Xuất file Excel thành công.");
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Xuất file Excel thất bại.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleImportExcel = async (file: File) => {
    try {
      setIsImportingExcel(true);

      const res = await importProductExcelApi(file);
      setImportResult(res);

      if ((res.errors?.length ?? 0) > 0) {
        toast.warning("Quá trình nhập hoàn tất nhưng có một số dòng lỗi.");
      } else {
        toast.success("Nhập sản phẩm từ file thành công.");
      }

      await fetchInventory();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Nhập sản phẩm từ file thất bại.");
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleDeleteInventory = async (id: number) => {
    try {
      await deleteInventory(id);
      await fetchInventory();
      toast.success("Xóa thành công");
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  return {
    inventoryItems,
    setInventoryItems,

    isProductDialogOpen,
    setIsProductDialogOpen,
    isEditingProduct,
    form,
    setForm,

    isInventoryDialogOpen,
    setIsInventoryDialogOpen,
    editingProductName,
    inventoryEditForm,
    setInventoryEditForm,

    isPurchaseReceiptDialogOpen,
    setIsPurchaseReceiptDialogOpen,
    purchaseReceiptVariantLabel,
    purchaseReceiptForm,
    setPurchaseReceiptForm,
    isSubmittingPurchaseReceipt,

    totalProducts,
    totalVariantCount,
    lowStockCount,
    outOfStockCount,

    resetForm,
    openCreateDialog,
    openEditDialog,
    openEditInventoryDialog,
    openPurchaseReceiptDialog,
    addVariant,
    updateVariant,
    removeVariant,
    handleSubmit,
    handleSaveInventory,
    handleCreatePurchaseReceipt,

    isExportDialogOpen,
    setIsExportDialogOpen,
    selectedExportColumns,
    setSelectedExportColumns,
    isExportingExcel,
    openExportDialog,
    handleExportExcel,

    isImportDialogOpen,
    setIsImportDialogOpen,
    isImportingExcel,
    importResult,
    openImportDialog,
    handleImportExcel,

    handleDeleteInventory,
    fetchInventory,

   
  };
}