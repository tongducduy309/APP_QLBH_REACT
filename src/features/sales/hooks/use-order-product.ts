import * as React from "react";
import { toast } from "sonner";
import type {
  InventoryProduct,
  OrderProductForm,
  OrderedProduct,
  PriceMode,
  ProductType,
} from "../types/order-product.types";
import {
  buildComputedProductName,
  buildCurvingOrder,
  buildMainOrder,
  buildPanelSizes,
  calculateComputedUnitPrice,
  calculateProfitAmount,
  clampWidth,
  createDefaultOrderForm,
  validateOrderForm,
} from "../lib/order-product.helpers";

type UseOrderProductParams = {
  open: boolean;
  product?: Partial<InventoryProduct>;
  onOrder: (order: OrderedProduct) => void;
};

export function useOrderProduct({
  open,
  product,
  onOrder,
}: UseOrderProductParams) {
  const lengthInputRef = React.useRef<HTMLInputElement | null>(null);

  const [form, setForm] = React.useState<OrderProductForm>(() =>
    createDefaultOrderForm(product),
  );
  const [priceMode, setPriceMode] = React.useState<PriceMode>("A");
  const [unit, setUnit] = React.useState(product?.baseUnit ?? "");

  React.useEffect(() => {
    if (!open) return;

    setForm(createDefaultOrderForm(product));
    setPriceMode("A");
    setUnit(product?.baseUnit ?? "");
    setTimeout(() => lengthInputRef.current?.focus(), 0);
  }, [open, product]);

  React.useEffect(() => {
    setForm((prev) => {
      if (priceMode === "C") return prev;

      return {
        ...prev,
        price: priceMode === "A"
          ? product?.retailPrice ?? 0
          : product?.storePrice ?? 0,
      };
    });
  }, [priceMode, product?.retailPrice, product?.storePrice]);

  const computedName = React.useMemo(
    () => buildComputedProductName(product, form),
    [product, form],
  );

  const computedUnitPrice = React.useMemo(
    () => calculateComputedUnitPrice(form, priceMode),
    [form, priceMode],
  );

  const profitAmount = React.useMemo(
    () => calculateProfitAmount(form.price, product),
    [form.price, product],
  );

  const setProductType = React.useCallback((type: ProductType) => {
    setForm((prev) => ({ ...prev, type }));
  }, []);

  const setCurvingEnabled = React.useCallback((enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      curving: {
        ...prev.curving,
        enabled,
      },
    }));
  }, []);

  const setCurvingPrice = React.useCallback((price: number) => {
    setForm((prev) => ({
      ...prev,
      curving: {
        ...prev.curving,
        price,
      },
    }));
  }, []);

  const setFlatSheetGroove = React.useCallback((hasGroove: boolean) => {
    setForm((prev) => ({
      ...prev,
      flatSheet: {
        ...prev.flatSheet,
        hasGroove,
      },
    }));
  }, []);

  const setFlatSheetWidth = React.useCallback((value: number) => {
    const safeWidth = clampWidth(value);

    setForm((prev) => ({
      ...prev,
      flatSheet: {
        ...prev.flatSheet,
        width: safeWidth,
        panelSizes: buildPanelSizes(safeWidth, prev.flatSheet.panelCount),
      },
    }));
  }, []);

  const setFlatSheetPanelCount = React.useCallback((panelCount: number) => {
    const safeCount = Math.max(1, Math.min(3, panelCount));

    setForm((prev) => ({
      ...prev,
      flatSheet: {
        ...prev.flatSheet,
        panelCount: safeCount,
        panelSizes: buildPanelSizes(prev.flatSheet.width, safeCount),
      },
    }));
  }, []);

  const setFlatSheetPanelSizeAt = React.useCallback((index: number, value: number) => {
    setForm((prev) => {
      const nextPanelSizes = [...prev.flatSheet.panelSizes];
      nextPanelSizes[index] = Number.isFinite(value) ? value : 0;

      return {
        ...prev,
        flatSheet: {
          ...prev.flatSheet,
          panelSizes: nextPanelSizes,
        },
      };
    });
  }, []);

  const setLength = React.useCallback((length: number) => {
    setForm((prev) => ({ ...prev, length }));
  }, []);

  const setQuantity = React.useCallback((quantity: number) => {
    setForm((prev) => ({ ...prev, quantity }));
  }, []);

  const setPrice = React.useCallback((price: number) => {
    setForm((prev) => ({ ...prev, price }));
  }, []);

  const resetForm = React.useCallback(() => {
    const currentPrice = form.price;
    setForm({
      ...createDefaultOrderForm(product),
      price: currentPrice,
    });
    setTimeout(() => lengthInputRef.current?.focus(), 0);
  }, [form.price, product]);

  const submit = React.useCallback(() => {
    const validationError = validateOrderForm({
      product,
      form,
      computedName,
      computedUnitPrice,
    });

    if (validationError) {
      toast.info(validationError);
      return;
    }

    const mainOrder = buildMainOrder({
      product,
      computedName,
      unit: unit || "",
      computedUnitPrice,
      form,
    });

    onOrder(mainOrder);

    if ((form.type === "B" || form.type === "C") && form.curving.enabled) {
      onOrder(buildCurvingOrder(form));
    }

    toast.success("Đã đặt hàng thành công.");
    resetForm();
  }, [
    product,
    form,
    computedName,
    computedUnitPrice,
    unit,
    onOrder,
    resetForm,
  ]);

  return {
    lengthInputRef,

    form,
    setForm,

    unit,
    setUnit,

    priceMode,
    setPriceMode,

    computedName,
    computedUnitPrice,
    profitAmount,

    setProductType,
    setCurvingEnabled,
    setCurvingPrice,
    setFlatSheetGroove,
    setFlatSheetWidth,
    setFlatSheetPanelCount,
    setFlatSheetPanelSizeAt,
    setLength,
    setQuantity,
    setPrice,

    submit,
  };
}