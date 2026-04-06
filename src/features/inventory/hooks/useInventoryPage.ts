// src/modules/inventory/hooks/useInventoryPage.ts

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
    InventoryEditForm,
    ProductForm,
    ProductVariantInventoryRes,
} from "../types/inventory.types";
import {
    createInitialForm,
    createInitialVariant,
    getProductStatusFromVariants,
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
import type { ProductInventoryRes } from "../types/inventory.types";
import { createProduct, getAllInventory, updateProduct } from "@/services/product-api";

export function useInventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<ProductInventoryRes[]>([]);

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [form, setForm] = useState<ProductForm>(createInitialForm());

    const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
    const [editingParentProductId, setEditingParentProductId] = useState<number | null>(null);
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [editingVariantLabel, setEditingVariantLabel] = useState("");

    const [inventoryEditForm, setInventoryEditForm] = useState<InventoryEditForm>({
        remainingQty: 0,
        costPrice: 0,
        active: true,
    });

    const isEditingProduct = editingProductId !== null;

    const totalProducts = useMemo(() => inventoryItems.length, [inventoryItems]);

    const totalVariantCount = useMemo(
        () =>
            inventoryItems.reduce((sum, item) => sum + (item.variants?.length ?? 0), 0),
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
            inventoryItems.filter(
                (item) => getTotalProductStock(item.variants ?? []) <= 0
            ).length,
        [inventoryItems]
    );

    const resetForm = () => {
        setForm(createInitialForm());
        setEditingProductId(null);
    };

    const resetInventoryEditState = () => {
        setEditingParentProductId(null);
        setEditingVariantId(null);
        setEditingVariantLabel("");
        setInventoryEditForm({
            remainingQty: 0,
            costPrice: 0,
            active: true,
        });
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
        setEditingVariantLabel(variant.variantCode || "Biến thể");
        setInventoryEditForm({
            remainingQty: Number(variant.remainingQty ?? 0),
            costPrice: Number(variant.costPrice ?? 0),
            active: Boolean(variant.active),
        });
        setIsInventoryDialogOpen(true);
    };

    const addVariant = () => {

        setForm((prev) => ({
            ...prev,
            variants: [...prev.variants, createInitialVariant()],
        }));
    };

    const updateVariant = (variantIndex: number, nextVariant: ProductVariantInventoryRes) => {
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

        if (isEditingProduct && editingProductId !== null) {

            const productReq = mapProductFormToUpdateReq(form, editingProductId);

            updateProduct(editingProductId, productReq).then(() => {
                fetchInventory();
                setIsProductDialogOpen(false);
                resetForm();
                toast.success("Cập nhật sản phẩm thành công.");
            }).catch(() => {
                toast.error("Cập nhật sản phẩm thất bại.");
            });

            // const updatedProduct = buildProductRowFromForm(form, editingProductId);
            

            // setInventoryItems((prev) =>
            //     prev.map((item) => (item.id === editingProductId ? updatedProduct : item))
            // );

            // toast.success("Cập nhật sản phẩm thành công.");
        } else {

            const productReq = await mapProductFormToCreateReq(form);

            createProduct(productReq).then(() => {
                fetchInventory();
                // const newProduct = buildProductRowFromForm(form, Date.now());
                setIsProductDialogOpen(false);
                resetForm();
                //   setInventoryItems((prev) => [newProduct, ...prev]);
                toast.success("Thêm mới sản phẩm thành công.");
            }).catch(() => {
                toast.error("Thêm mới sản phẩm thất bại.");
            });


        }


    };

    const handleSaveInventory = () => {
        if (editingParentProductId === null || !editingVariantId) return;

        const isValid = validateInventoryEditForm(inventoryEditForm);
        if (!isValid) return;

        setInventoryItems((prev) =>
            prev.map((item) => {
                if (item.id !== editingParentProductId) return item;

                const nextVariants = (item.variants ?? []).map((variant) =>
                    variant?.variantId === editingVariantId
                        ? {
                            ...variant,
                            remainingQty: Number(inventoryEditForm.remainingQty ?? 0),
                            costPrice: Number(inventoryEditForm.costPrice ?? 0),
                            active: Boolean(inventoryEditForm.active),
                            outOfStock: Number(inventoryEditForm.remainingQty ?? 0) <= 0,
                        }
                        : variant
                );

                return {
                    ...item,
                    variants: nextVariants,
                    stock: getTotalProductStock(nextVariants),
                    status: getProductStatusFromVariants(nextVariants),
                };
            })
        );

        toast.success("Cập nhật tồn kho biến thể thành công.");
        setIsInventoryDialogOpen(false);
        resetInventoryEditState();
    };


    const fetchInventory = async () => {
        try {
            const data = await getAllInventory();
            setInventoryItems(data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

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
        editingVariantLabel,
        inventoryEditForm,
        setInventoryEditForm,

        totalProducts,
        totalVariantCount,
        lowStockCount,
        outOfStockCount,

        resetForm,
        openCreateDialog,
        openEditDialog,
        openEditInventoryDialog,
        addVariant,
        updateVariant,
        removeVariant,
        handleSubmit,
        handleSaveInventory,
    };
}