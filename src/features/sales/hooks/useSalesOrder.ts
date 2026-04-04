// src/modules/sales/hooks/useSalesOrder.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderedProduct } from "../types/order-product.types";
import type {
  CartLineItem,
  CustomerOrderInfo,
  EditableOrderedGroup,
  OtherExpenseDraft,
  Product,
} from "../types/sales.types";
import {
  calculateChangeAmount,
  calculateRemainingAmount,
  calculateTaxAmount,
  toNumber,
} from "../utils/sales-calculations";
import {
  buildOrderedDisplayItems,
  buildProductGroupKey,
  groupProductItems,
} from "../utils/sales-grouping";
import {
  mapExpenseToCartLine,
  mapOrderedProductsToCartLines,
} from "../utils/sales-mappers";
import { getNextOrderCode } from "@/services/order-api";

const todayInputValue = new Date().toISOString();

export const createOrderCodeFallback = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `HD-${y}${m}${d}-${rand}`;
};

export function useSalesOrder() {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const [customerOrderInfo, setCustomerOrderInfo] = useState<CustomerOrderInfo>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    orderCode: "",
    createdDate: todayInputValue,
    note: "",
  });

  const [otherExpenseDraft, setOtherExpenseDraft] = useState<OtherExpenseDraft>({
    description: "",
    quantity: 1,
    length: 0,
    price: 0,
    unit: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);

  // const nonInventoryItems = useMemo(
  //   () => cartItems.filter((item) => item.kind === "non_inventory"),
  //   [cartItems]
  // );

  const inventoryItems = useMemo(
    () => cartItems.filter((item) => item.kind === "inventory" || item.kind === "non_inventory"),
    [cartItems]
  );

  const expenseItems = useMemo(
    () => cartItems.filter((item) => item.kind === "expense"),
    [cartItems]
  );

  const groupedProductItems = useMemo(
    () => groupProductItems(inventoryItems),
    [inventoryItems]
  );

  const orderedDisplayItems = useMemo(
    () => buildOrderedDisplayItems(groupedProductItems, expenseItems),
    [groupedProductItems, expenseItems]
  );

  const editingGroup = useMemo(() => {
    if (!editingGroupKey) return null;
    return groupedProductItems.find((item) => item.groupKey === editingGroupKey) ?? null;
  }, [editingGroupKey, groupedProductItems]);

  const editDialogValue = useMemo<EditableOrderedGroup | null>(() => {
    if (!editingGroup) return null;

    return {
      name: editingGroup.name,
      unit: editingGroup.unit || "",
      price: editingGroup.price,
      productId: editingGroup.productId ?? null,
      variantId: editingGroup.variantId ?? null,
      sizeLines: editingGroup.sizeLines.map((line) => ({
        length: line.length,
        quantity: line.quantity,
      })),
    };
  }, [editingGroup]);

  const productSubtotal = useMemo(
    () => inventoryItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [inventoryItems]
  );

  const otherExpenseSubtotal = useMemo(
    () => expenseItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [expenseItems]
  );

  const subTotalBeforeTax = useMemo(
    () => productSubtotal + otherExpenseSubtotal + shippingFee - discount,
    [productSubtotal, otherExpenseSubtotal, shippingFee, discount]
  );

  const taxAmount = useMemo(
    () => calculateTaxAmount(subTotalBeforeTax, taxPercent),
    [subTotalBeforeTax, taxPercent]
  );

  const grandTotal = useMemo(
    () => subTotalBeforeTax + taxAmount,
    [subTotalBeforeTax, taxAmount]
  );

  const remainingAmount = useMemo(
    () => calculateRemainingAmount(grandTotal, paidAmount),
    [grandTotal, paidAmount]
  );

  const changeAmount = useMemo(
    () => calculateChangeAmount(grandTotal, paidAmount),
    [grandTotal, paidAmount]
  );

  const handleAddOrder = (orders: OrderedProduct[]) => {
    const fallbackUnit = selectedProduct?.baseUnit || "mét";
    const newLines = mapOrderedProductsToCartLines(orders, fallbackUnit);
    setCartItems((prev) => [...prev, ...newLines]);
  };

  const handleUpdateOrder = (orders: OrderedProduct[]) => {
    if (!editingGroup) return;

    const fallbackUnit = editingGroup.unit || "mét";
    const updatedLines = mapOrderedProductsToCartLines(orders, fallbackUnit);

    setCartItems((prev) => {
      const remain = prev.filter(
        (item) =>
          item.kind !== "inventory" ||
          buildProductGroupKey(item) !== editingGroup.groupKey
      );
      return [...remain, ...updatedLines];
    });

    setEditingGroupKey(null);
  };

  const addOtherExpense = () => {
    const description = otherExpenseDraft.description.trim();
    if (!description) return;

    const quantity = toNumber(otherExpenseDraft.quantity);
    const length = toNumber(otherExpenseDraft.length);
    const price = toNumber(otherExpenseDraft.price);

    if (quantity <= 0 || price < 0) return;

    const newExpense = mapExpenseToCartLine({
      description,
      quantity,
      length,
      price,
      unit: otherExpenseDraft.unit,
    });

    setCartItems((prev) => [...prev, newExpense]);

    setOtherExpenseDraft({
      description: "",
      quantity: 1,
      length: 0,
      price: 0,
      unit: "",
    });
  };

  const removeCartItem = (rowId: string) => {
    setCartItems((prev) => prev.filter((item) => item.rowId !== rowId));
  };

  const removeProductGroup = (groupKey: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => (item.kind !== "inventory" && item.kind !== "non_inventory") || buildProductGroupKey(item) !== groupKey
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setEditingGroupKey(null);
  };

  const resetWholeOrder = () => {
    setCartItems([]);
    setEditingGroupKey(null);
    setShippingFee(0);
    setTaxPercent(0);
    setDiscount(0);
    setPaidAmount(0);
    setOtherExpenseDraft({
      description: "",
      quantity: 1,
      length: 0,
      price: 0,
      unit: "",
    });
    setCustomerOrderInfo({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      orderCode: "",
      createdDate: todayInputValue,
      note: "",
    });
    fetchOrderCode();
  };

  const handleCheckout = () => {
    return {
      customer: {
        name: customerOrderInfo.customerName,
        phone: customerOrderInfo.customerPhone,
        address: customerOrderInfo.customerAddress,
      },
      order: {
        code: customerOrderInfo.orderCode,
        createdDate: customerOrderInfo.createdDate,
        note: customerOrderInfo.note,
      },
      items: cartItems,
      summary: {
        productSubtotal,
        otherExpenseSubtotal,
        shippingFee,
        discount,
        taxPercent,
        taxAmount,
        grandTotal,
        paidAmount,
        remainingAmount,
        changeAmount,
      },
    };
  };

  const fetchOrderCode = useCallback(async () => {
      try {
        const code = await getNextOrderCode();
        setCustomerOrderInfo((prev) => ({
          ...prev,
          orderCode: code,
        }));
      } catch {}
    }, []);
      

  useEffect(() => {
    

    fetchOrderCode();
  }, []);

  return {
    cartItems,
    setCartItems,
    shippingFee,
    setShippingFee,
    taxPercent,
    setTaxPercent,
    discount,
    setDiscount,
    paidAmount,
    setPaidAmount,

    customerOrderInfo,
    setCustomerOrderInfo,

    otherExpenseDraft,
    setOtherExpenseDraft,

    selectedProduct,
    setSelectedProduct,

    editingGroupKey,
    setEditingGroupKey,
    editingGroup,
    editDialogValue,

    inventoryItems,
    expenseItems,
    groupedProductItems,
    orderedDisplayItems,

    productSubtotal,
    otherExpenseSubtotal,
    subTotalBeforeTax,
    taxAmount,
    grandTotal,
    remainingAmount,
    changeAmount,

    handleAddOrder,
    handleUpdateOrder,
    addOtherExpense,
    removeCartItem,
    removeProductGroup,
    clearCart,
    resetWholeOrder,
    handleCheckout,
  };
}