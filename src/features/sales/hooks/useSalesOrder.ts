import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
  getEffectiveQuantity,
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

const DEFAULT_STORAGE_KEY = "sales-multi-order-draft-v2";


const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const EDIT_DRAFT_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const MAX_PERSISTED_ORDERS = 10;
const STORAGE_VERSION = 1;

const nowIso = () => new Date().toISOString();

export const createOrderCodeFallback = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);

  return `HD-${y}${m}${d}-${rand}`;
};

const createDraftId = () => {
  return new Date().getTime() + Math.floor(Math.random() * 1000);
};

const createDefaultCustomerOrderInfo = (): CustomerOrderInfo => ({
  customerId: null,
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  orderCode: "",
  createdDate: nowIso(),
  note: "",
});

const createDefaultOtherExpenseDraft = (): OtherExpenseDraft => ({
  description: "",
  price: 0,
  length: 1,
  quantity: 0,
  unit: ""
});

type ReplaceActiveOrderDraftInput = {
  cartItems?: CartLineItem[];
  shippingFee?: number;
  taxPercent?: number;
  discount?: number;
  paidAmount?: number;
  customerOrderInfo?: Partial<CustomerOrderInfo>;
  otherExpenseDraft?: Partial<OtherExpenseDraft>;
  selectedProduct?: Product | null;
  editingGroupKey?: string | null;
};

type PersistedOrder = {
  id: number;
  cartItems: SalesOrderDraft["cartItems"];
  shippingFee: number;
  taxPercent: number;
  discount: number;
  paidAmount: number;
  customerOrderInfo: SalesOrderDraft["customerOrderInfo"];
  otherExpenseDraft: SalesOrderDraft["otherExpenseDraft"];
  createdAt: string;
};

type PersistedState = {
  version: number;
  activeOrderId: number | null;
  updatedAt: string;
  expiresAt: string;
  orders: PersistedOrder[];
};

type UseSalesOrdersOptions = {
  storageKey?: string;
};

const createEmptyDraft = (): SalesOrderDraft => ({
  id: createDraftId(),
  cartItems: [],
  shippingFee: 0,
  taxPercent: 0,
  discount: 0,
  paidAmount: 0,
  customerOrderInfo: createDefaultCustomerOrderInfo(),
  otherExpenseDraft: createDefaultOtherExpenseDraft(),
  editingGroupKey: null,
  selectedProduct: null,
  createdAt: nowIso(),
});

const isDraftMeaningful = (draft: SalesOrderDraft) => {
  const info = draft.customerOrderInfo;

  return Boolean(
    draft.cartItems.length > 0 ||
      draft.shippingFee > 0 ||
      draft.taxPercent > 0 ||
      draft.discount > 0 ||
      draft.paidAmount > 0 ||
      info.customerName?.trim() ||
      info.customerPhone?.trim() ||
      info.customerAddress?.trim() ||
      info.note?.trim() ||
      draft.otherExpenseDraft.description?.trim() ||
      Number(draft.otherExpenseDraft.price) > 0 ||
      Number(draft.otherExpenseDraft.length) > 0
  );
};

const getTtlByStorageKey = (storageKey: string) => {
  return storageKey.startsWith("sales-edit-order-draft-")
    ? EDIT_DRAFT_TTL_MS
    : DRAFT_TTL_MS;
};

const isExpired = (expiresAt?: string | null) => {
  if (!expiresAt) return true;

  const time = new Date(expiresAt).getTime();
  return Number.isNaN(time) || time <= Date.now();
};

const toPersistedOrder = (draft: SalesOrderDraft): PersistedOrder => ({
  id: draft.id,
  cartItems: Array.isArray(draft.cartItems) ? draft.cartItems : [],
  shippingFee: Number(draft.shippingFee ?? 0),
  taxPercent: Number(draft.taxPercent ?? 0),
  discount: Number(draft.discount ?? 0),
  paidAmount: Number(draft.paidAmount ?? 0),
  customerOrderInfo: {
    ...createDefaultCustomerOrderInfo(),
    ...(draft.customerOrderInfo ?? {}),
  },
  otherExpenseDraft: {
    ...createDefaultOtherExpenseDraft(),
    ...(draft.otherExpenseDraft ?? {}),
  },
  createdAt: draft.createdAt ?? nowIso(),
});

const normalizeOrdersFromStorage = (
  orders?: PersistedOrder[] | null
): SalesOrderDraft[] => {
  if (!Array.isArray(orders)) return [];

  return orders.map((item) => ({
    id: item.id ?? createDraftId(),
    cartItems: Array.isArray(item.cartItems) ? item.cartItems : [],
    shippingFee: Number(item.shippingFee ?? 0),
    taxPercent: Number(item.taxPercent ?? 0),
    discount: Number(item.discount ?? 0),
    paidAmount: Number(item.paidAmount ?? 0),
    customerOrderInfo: {
      ...createDefaultCustomerOrderInfo(),
      ...(item.customerOrderInfo ?? {}),
    },
    otherExpenseDraft: {
      ...createDefaultOtherExpenseDraft(),
      ...(item.otherExpenseDraft ?? {}),
    },
    editingGroupKey: null,
    selectedProduct: null,
    createdAt: item.createdAt ?? nowIso(),
  }));
};

const buildPersistedState = (
  storageKey: string,
  payload: {
    activeOrderId: number | null;
    orders: SalesOrderDraft[];
  }
): PersistedState | null => {
  const meaningfulOrders = payload.orders
    .filter(isDraftMeaningful)
    .map(toPersistedOrder)
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, MAX_PERSISTED_ORDERS);

  if (meaningfulOrders.length === 0) return null;

  const activeOrderId = meaningfulOrders.some(
    (item) => item.id === payload.activeOrderId
  )
    ? payload.activeOrderId
    : meaningfulOrders[0]?.id ?? null;

  return {
    version: STORAGE_VERSION,
    activeOrderId,
    updatedAt: nowIso(),
    expiresAt: new Date(Date.now() + getTtlByStorageKey(storageKey)).toISOString(),
    orders: meaningfulOrders,
  };
};

const readStorage = (storageKey: string): PersistedState | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    if (isExpired(parsed.expiresAt ?? null)) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    const normalizedOrders = normalizeOrdersFromStorage(parsed.orders);

    if (normalizedOrders.length === 0) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    const activeOrderId =
      normalizedOrders.some((item) => item.id === parsed.activeOrderId)
        ? (parsed.activeOrderId ?? null)
        : normalizedOrders[0]?.id ?? null;

    return {
      version: Number(parsed.version ?? STORAGE_VERSION),
      activeOrderId,
      updatedAt: parsed.updatedAt ?? nowIso(),
      expiresAt:
        parsed.expiresAt ??
        new Date(Date.now() + getTtlByStorageKey(storageKey)).toISOString(),
      orders: normalizedOrders.map(toPersistedOrder),
    };
  } catch (error) {
    console.error("Không thể đọc dữ liệu hóa đơn nháp", error);
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

const writeStorage = (
  storageKey: string,
  payload: {
    activeOrderId: number | null;
    orders: SalesOrderDraft[];
  }
) => {
  if (typeof window === "undefined") return;

  try {
    const nextState = buildPersistedState(storageKey, payload);

    if (!nextState) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
  } catch (error) {
    console.error("Không thể lưu dữ liệu hóa đơn nháp", error);
  }
};




export type SalesOrderDraft = {
  id: number;
  cartItems: CartLineItem[];
  shippingFee: number;
  taxPercent: number;
  discount: number;
  paidAmount: number;
  customerOrderInfo: CustomerOrderInfo;
  otherExpenseDraft: OtherExpenseDraft;
  editingGroupKey: string | null;
  selectedProduct: Product | null;
  createdAt: string;
};




const moveArrayItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const getDraftLabel = (draft: SalesOrderDraft, index: number) => {
  const customerName = draft.customerOrderInfo.customerName?.trim();
  if (customerName) return customerName;

  const customerPhone = draft.customerOrderInfo.customerPhone?.trim();
  if (customerPhone) return customerPhone;

  return `Hóa đơn ${index + 1}`;
};

function isProductCartItem(item: CartLineItem) {
  return item.kind === "INVENTORY" || item.kind === "NON_INVENTORY";
}

function buildStockKey(input: {
  inventoryId?: number | null;
  variantId?: number | null;
  productId?: number | null;
}) {
  if (input.inventoryId != null) return `inventory:${input.inventoryId}`;
  if (input.variantId != null) return `variant:${input.variantId}`;
  return `product:${input.productId ?? 0}`;
}

// function getProductDisplayName(product?: {
//   name?: string | null;
//   variantCode?: string | null;
// }) {
//   const name = product?.name?.trim();
//   const variantCode = product?.variantCode?.trim();

//   if (name && variantCode) return `${name} - ${variantCode}`;
//   return name || variantCode || "Sản phẩm";
// }

export function useSalesOrders(options?: UseSalesOrdersOptions) {
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY;

  const storageRef = useRef<PersistedState | null>(readStorage(storageKey));
  const fallbackDraftRef = useRef<SalesOrderDraft>(createEmptyDraft());

  const [orders, setOrders] = useState<SalesOrderDraft[]>(() => {
    const savedOrders = normalizeOrdersFromStorage(storageRef.current?.orders);
    return savedOrders.length > 0 ? savedOrders : [fallbackDraftRef.current];
  });

  const [activeOrderId, setActiveOrderId] = useState<number | null>(() => {
    const savedOrders = normalizeOrdersFromStorage(storageRef.current?.orders);
    const savedActiveId = storageRef.current?.activeOrderId;

    if (savedActiveId && savedOrders.some((item) => item.id === savedActiveId)) {
      return savedActiveId;
    }

    if (savedOrders.length > 0) {
      return savedOrders[0].id;
    }

    return fallbackDraftRef.current.id;
  });

  const activeOrder = useMemo(() => {
    return orders.find((order) => order.id === activeOrderId) ?? orders[0] ?? null;
  }, [orders, activeOrderId]);

  const updateOrder = useCallback(
    (orderId: number, updater: (draft: SalesOrderDraft) => SalesOrderDraft) => {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updater(order) : order))
      );
    },
    []
  );

  const updateActiveOrder = useCallback(
  (updater: (draft: SalesOrderDraft) => SalesOrderDraft) => {
    setOrders((prev) => {
      if (prev.length === 0) {
        const fallback = createEmptyDraft();
        const nextDraft = updater(fallback);
        setActiveOrderId(nextDraft.id);
        return [nextDraft];
      }

      const targetId = activeOrderId ?? prev[0].id;

      return prev.map((order) =>
        order.id === targetId ? updater(order) : order
      );
    });

    if (activeOrderId == null) {
      setActiveOrderId((prev) => prev ?? orders[0]?.id ?? null);
    }
  },
  [activeOrderId, orders]
);

  const assignOrderCodeForDraft = useCallback(
    async (draftId: number) => {
      let orderCode = createOrderCodeFallback();

      try {
        orderCode = (await getNextOrderCode()) || orderCode;
      } catch {
        // fallback
      }

      updateOrder(draftId, (draft) => ({
        ...draft,
        customerOrderInfo: {
          ...draft.customerOrderInfo,
          orderCode,
        },
      }));
    },
    [updateOrder]
  );

  useEffect(() => {
    assignOrderCodeForDraft(activeOrderId ?? 0);
  }, []);

  const createNewOrder = useCallback(async () => {
    const newDraft: SalesOrderDraft = {
      ...createEmptyDraft(),
    };

    setOrders((prev) => [...prev, newDraft]);
    setActiveOrderId(newDraft.id);

    await assignOrderCodeForDraft(newDraft.id);
  }, [assignOrderCodeForDraft]);

  const replaceActiveOrderDraft = useCallback(
    (payload: ReplaceActiveOrderDraftInput) => {
      updateActiveOrder((draft) => ({
        ...draft,
        cartItems: payload.cartItems ?? [],
        shippingFee: Number(payload.shippingFee ?? 0),
        taxPercent: Number(payload.taxPercent ?? 0),
        discount: Number(payload.discount ?? draft.discount ?? 0),
        paidAmount: Number(payload.paidAmount ?? 0),
        customerOrderInfo: {
          ...createDefaultCustomerOrderInfo(),
          ...draft.customerOrderInfo,
          ...(payload.customerOrderInfo ?? {}),
        },
        otherExpenseDraft: {
          ...createDefaultOtherExpenseDraft(),
          ...(payload.otherExpenseDraft ?? {}),
        },
        selectedProduct:
          payload.selectedProduct === undefined
            ? draft.selectedProduct
            : payload.selectedProduct,
        editingGroupKey:
          payload.editingGroupKey === undefined
            ? draft.editingGroupKey
            : payload.editingGroupKey,
      }));
    },
    [updateActiveOrder]
  );

  const setWholeOrderForEdit = useCallback(
    ({
      cartItems,
      shippingFee,
      taxPercent,
      paidAmount,
      customerOrderInfo,
    }: {
      cartItems: CartLineItem[];
      shippingFee: number;
      taxPercent: number;
      paidAmount: number;
      customerOrderInfo: Partial<CustomerOrderInfo>;
    }) => {
      replaceActiveOrderDraft({
        cartItems,
        shippingFee,
        taxPercent,
        paidAmount,
        customerOrderInfo,
        otherExpenseDraft: createDefaultOtherExpenseDraft(),
        selectedProduct: null,
        editingGroupKey: null,
      });
    },
    [replaceActiveOrderDraft]
  );

  const removeOrder = useCallback(
    (orderId: number) => {
      const target = orders.find((item) => item.id === orderId);
      if (!target) return { removed: false, needConfirm: false };

      if (isDraftMeaningful(target)) {
        return { removed: false, needConfirm: true };
      }

      setOrders((prev) => {
        const next = prev.filter((item) => item.id !== orderId);

        if (next.length === 0) {
          const fallback = createEmptyDraft();
          setActiveOrderId(fallback.id);
          return [fallback];
        }

        if (activeOrderId === orderId) {
          setActiveOrderId(next[0].id);
        }

        return next;
      });

      return { removed: true, needConfirm: false };
    },
    [orders, activeOrderId]
  );

  const forceRemoveOrder = useCallback(
    (orderId: number) => {
      setOrders((prev) => {
        const next = prev.filter((item) => item.id !== orderId);

        if (next.length === 0) {
          const fallback = createEmptyDraft();
          setActiveOrderId(fallback.id);
          return [fallback];
        }

        if (activeOrderId === orderId) {
          setActiveOrderId(next[0].id);
        }

        return next;
      });
    },
    [activeOrderId]
  );

  const reorderOrders = useCallback((fromId: number, toId: number) => {
    if (fromId === toId) return;

    setOrders((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === fromId);
      const toIndex = prev.findIndex((item) => item.id === toId);

      if (fromIndex < 0 || toIndex < 0) return prev;
      return moveArrayItem(prev, fromIndex, toIndex);
    });
  }, []);

  const clearActiveOrder = useCallback(async () => {
    if (!activeOrderId) return;

    updateOrder(activeOrderId, (draft) => ({
      ...createEmptyDraft(),
      id: draft.id,
      createdAt: draft.createdAt,
    }));

    await assignOrderCodeForDraft(activeOrderId);
  }, [activeOrderId, assignOrderCodeForDraft, updateOrder]);

  const setCartItems = useCallback(
    (value: CartLineItem[] | ((prev: CartLineItem[]) => CartLineItem[])) => {
      updateActiveOrder((draft) => ({
        ...draft,
        cartItems: typeof value === "function" ? value(draft.cartItems) : value,
      }));
    },
    [updateActiveOrder]
  );

  const setShippingFee = useCallback(
    (value: number | ((prev: number) => number)) => {
      updateActiveOrder((draft) => ({
        ...draft,
        shippingFee:
          typeof value === "function" ? value(draft.shippingFee) : value,
      }));
    },
    [updateActiveOrder]
  );

  const setTaxPercent = useCallback(
    (value: number | ((prev: number) => number)) => {
      updateActiveOrder((draft) => ({
        ...draft,
        taxPercent:
          typeof value === "function" ? value(draft.taxPercent) : value,
      }));
    },
    [updateActiveOrder]
  );

  const setPaidAmount = useCallback(
    (value: number | ((prev: number) => number)) => {
      updateActiveOrder((draft) => ({
        ...draft,
        paidAmount:
          typeof value === "function" ? value(draft.paidAmount) : value,
      }));
    },
    [updateActiveOrder]
  );

  const setCustomerOrderInfo = useCallback(
    (
      value:
        | CustomerOrderInfo
        | ((prev: CustomerOrderInfo) => CustomerOrderInfo)
    ) => {
      updateActiveOrder((draft) => ({
        ...draft,
        customerOrderInfo:
          typeof value === "function"
            ? value(draft.customerOrderInfo)
            : value,
      }));
    },
    [updateActiveOrder]
  );

  const setOtherExpenseDraft = useCallback(
    (
      value:
        | OtherExpenseDraft
        | ((prev: OtherExpenseDraft) => OtherExpenseDraft)
    ) => {
      updateActiveOrder((draft) => ({
        ...draft,
        otherExpenseDraft:
          typeof value === "function"
            ? value(draft.otherExpenseDraft)
            : value,
      }));
    },
    [updateActiveOrder]
  );

  const setSelectedProduct = useCallback(
    (value: Product | null) => {
      updateActiveOrder((draft) => ({
        ...draft,
        selectedProduct: value,
      }));
    },
    [updateActiveOrder]
  );

  const setEditingGroupKey = useCallback(
    (value: string | null) => {
      updateActiveOrder((draft) => ({
        ...draft,
        editingGroupKey: value,
      }));
    },
    [updateActiveOrder]
  );

  const cartItems = activeOrder?.cartItems ?? [];
  const shippingFee = activeOrder?.shippingFee ?? 0;
  const taxPercent = activeOrder?.taxPercent ?? 0;
  const discount = activeOrder?.discount ?? 0;
  const paidAmount = activeOrder?.paidAmount ?? 0;
  const customerOrderInfo =
    activeOrder?.customerOrderInfo ?? createDefaultCustomerOrderInfo();
  const otherExpenseDraft =
    activeOrder?.otherExpenseDraft ?? createDefaultOtherExpenseDraft();
  const selectedProduct = activeOrder?.selectedProduct ?? null;
  const editingGroupKey = activeOrder?.editingGroupKey ?? null;

  const inventoryItems = useMemo(() => {
    return cartItems.filter(isProductCartItem);
  }, [cartItems]);

  const expenseItems = useMemo(() => {
    return cartItems.filter((item) => item.kind === "EXPENSE");
  }, [cartItems]);

  const groupedProductItems = useMemo(() => {
    return groupProductItems(inventoryItems);
  }, [inventoryItems]);

  const orderedDisplayItems = useMemo(() => {
    return buildOrderedDisplayItems(groupedProductItems, expenseItems);
  }, [groupedProductItems, expenseItems]);

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
      inventoryId: editingGroup.inventoryId ?? null,
      sizeLines: editingGroup.sizeLines.map((line) => ({
        length: line.length,
        quantity: line.quantity,
      })),
    };
  }, [editingGroup]);

  const productSubtotal = useMemo(() => {
    return inventoryItems.reduce(
      (sum, item) => sum + getEffectiveQuantity(item) * Number(item.price ?? 0),
      0
    );
  }, [inventoryItems]);

  const otherExpenseSubtotal = useMemo(() => {
    return expenseItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [expenseItems]);

  const subTotalBeforeTax = useMemo(() => {
    return productSubtotal + otherExpenseSubtotal + shippingFee - discount;
  }, [productSubtotal, otherExpenseSubtotal, shippingFee, discount]);

  const taxAmount = useMemo(() => {
    return calculateTaxAmount(subTotalBeforeTax, taxPercent);
  }, [subTotalBeforeTax, taxPercent]);

  const grandTotal = useMemo(() => {
    return subTotalBeforeTax + taxAmount;
  }, [subTotalBeforeTax, taxAmount]);

  const remainingAmount = useMemo(() => {
    return calculateRemainingAmount(grandTotal, paidAmount);
  }, [grandTotal, paidAmount]);

  const changeAmount = useMemo(() => {
    return calculateChangeAmount(grandTotal, paidAmount);
  }, [grandTotal, paidAmount]);

  const reservedStockMap = useMemo(() => {
    const map = new Map<string, number>();

    if (!activeOrder) return map;

    activeOrder.cartItems.forEach((item) => {
      if (!isProductCartItem(item)) return;

      const key = buildStockKey({
        inventoryId: item.inventoryId ?? null,
        variantId: item.variantId ?? null,
        productId: item.productId ?? null,
      });

      map.set(key, (map.get(key) ?? 0) + (item.kind === "INVENTORY" ? getEffectiveQuantity(item) : 0));
    });

    return map;
  }, [activeOrder]);

  const clearStorageByKey = (storageKey: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Không thể xóa dữ liệu hóa đơn nháp", error);
    }
  };

  const removeOrderFromStorage = (
    storageKey: string,
    orderId: number
  ): PersistedState | null => {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      const orders = Array.isArray(parsed.orders) ? parsed.orders : [];
      const nextOrders = orders.filter((item: any) => item?.id !== orderId);

      const nextState: PersistedState = {
        activeOrderId: parsed.activeOrderId === orderId
          ? nextOrders[0]?.id ?? null
          : (parsed.activeOrderId as number | null) ?? nextOrders[0]?.id ?? null,
        orders: nextOrders,
        version: 0,
        updatedAt: "",
        expiresAt: ""
      };

      if (nextOrders.length === 0) {
        window.localStorage.removeItem(storageKey);
        return {
          activeOrderId: null, 
          orders: [],
          version: 0,
          updatedAt: "",
          expiresAt: "",
        };
      }

      window.localStorage.setItem(storageKey, JSON.stringify(nextState));
      return nextState;
    } catch (error) {
      console.error("Không thể xóa hóa đơn khỏi bộ nhớ", error);
      return null;
    }
  };

  const clearPersistedState = useCallback(() => {
    clearStorageByKey(storageKey);
    const fallback = createEmptyDraft();
    setOrders([fallback]);
    setActiveOrderId(fallback.id);
  }, [storageKey]);

  const clearCurrentDraftOnly = useCallback(() => {
    if (!activeOrderId) return;

    const nextState = removeOrderFromStorage(storageKey, activeOrderId);

    if (!nextState || nextState.orders.length === 0) {
      const fallback = createEmptyDraft();
      setOrders([fallback]);
      setActiveOrderId(fallback.id);
      return;
    }

    const normalizedOrders = normalizeOrdersFromStorage(nextState.orders);
    setOrders(normalizedOrders);
    setActiveOrderId(nextState.activeOrderId ?? normalizedOrders[0]?.id ?? null);
  }, [storageKey, activeOrderId]);

  const removePersistedOrderById = useCallback(
    (orderId: number) => {
      const nextState = removeOrderFromStorage(storageKey, orderId);

      if (!nextState || nextState.orders.length === 0) {
        const fallback = createEmptyDraft();
        setOrders([fallback]);
        setActiveOrderId(fallback.id);
        return;
      }

      const normalizedOrders = normalizeOrdersFromStorage(nextState.orders);
      setOrders(normalizedOrders);
      setActiveOrderId(nextState.activeOrderId ?? normalizedOrders[0]?.id ?? null);
    },
    [storageKey]
  );

  const getReservedQuantity = useCallback(
    (input: {
      inventoryId?: number | null;
      variantId?: number | null;
      productId?: number | null;
    }) => {
      const key = buildStockKey(input);
      return reservedStockMap.get(key) ?? 0;
    },
    [reservedStockMap]
  );

  const getAvailableStock = useCallback(
    (
      productLike: {
        inventoryId?: number | null;
        variantId?: number | null;
        id?: number | null;
        productId?: number | null;
        stock?: number | null;
        realStock?: number | null;
      },
      options?: {
        editingGroupKey?: string | null;
      }
    ) => {
      const key = buildStockKey({
        inventoryId: productLike.inventoryId ?? null,
        variantId: productLike.variantId ?? null,
        productId: productLike.productId ?? productLike.id ?? null,
      });

      const realStock = Number(productLike.realStock ?? productLike.stock ?? 0);
      const reservedAll = reservedStockMap.get(key) ?? 0;

      let editingOldQty = 0;

      if (options?.editingGroupKey && activeOrder) {
        activeOrder.cartItems.forEach((item) => {
          if (!isProductCartItem(item)) return;
          if (buildProductGroupKey(item) !== options.editingGroupKey) return;

          const editingKey = buildStockKey({
            inventoryId: item.inventoryId ?? null,
            variantId: item.variantId ?? null,
            productId: item.productId ?? null,
          });

          if (editingKey === key) {
            
            editingOldQty += getEffectiveQuantity(item);
          }
        });
      }

      return Math.max(realStock - reservedAll + editingOldQty, 0);
    },
    [activeOrder, reservedStockMap]
  );



  const handleAddOrder = useCallback(
    (orderedProducts: OrderedProduct[]) => {

      console.log("orderedProducts", orderedProducts);
      if (!selectedProduct) {
        toast.info("Chưa chọn sản phẩm.");
        return;
      }


      const fallbackUnit = selectedProduct.baseUnit || "mét";
      const newLines = mapOrderedProductsToCartLines(orderedProducts, fallbackUnit);


      updateActiveOrder((draft) => ({
        ...draft,
        cartItems: [...draft.cartItems, ...newLines],
      }));
    },
    [selectedProduct, updateActiveOrder]
  );

  const handleUpdateOrder = useCallback(
    (orderedProducts: OrderedProduct[]) => {
      if (!editingGroup) return;
      if (!selectedProduct) {
        toast.info("Chưa chọn sản phẩm.");
        return;
      }


      const fallbackUnit = editingGroup.unit || "mét";
      const updatedLines = mapOrderedProductsToCartLines(
        orderedProducts,
        fallbackUnit
      );

      updateActiveOrder((draft) => {
        const remain = draft.cartItems.filter(
          (item) =>
            !isProductCartItem(item) ||
            buildProductGroupKey(item) !== editingGroup.groupKey
        );

        return {
          ...draft,
          cartItems: [...remain, ...updatedLines],
          editingGroupKey: null,
        };
      });
    },
    [editingGroup, selectedProduct, updateActiveOrder]
  );

  const addOtherExpense = useCallback(() => {
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

    updateActiveOrder((draft) => ({
      ...draft,
      cartItems: [...draft.cartItems, newExpense],
      otherExpenseDraft: createDefaultOtherExpenseDraft(),
    }));
  }, [otherExpenseDraft, updateActiveOrder]);

  const removeCartItem = useCallback(
    (rowId: string) => {
      updateActiveOrder((draft) => ({
        ...draft,
        cartItems: draft.cartItems.filter((item) => item.rowId !== rowId),
      }));
    },
    [updateActiveOrder]
  );

  const removeProductGroup = useCallback(
    (groupKey: string) => {
      updateActiveOrder((draft) => ({
        ...draft,
        cartItems: draft.cartItems.filter(
          (item) =>
            !isProductCartItem(item) || buildProductGroupKey(item) !== groupKey
        ),
      }));
    },
    [updateActiveOrder]
  );

  const clearCart = useCallback(() => {
    updateActiveOrder((draft) => ({
      ...draft,
      cartItems: [],
      editingGroupKey: null,
    }));
  }, [updateActiveOrder]);

  const handleCheckout = useCallback(() => {
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
  }, [
    customerOrderInfo,
    cartItems,
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
  ]);

    useEffect(() => {
    if (typeof window === "undefined") return;

    writeStorage(storageKey, {
      activeOrderId,
      orders,
    });
  }, [storageKey, activeOrderId, orders]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: BeforeUnloadEvent) => {
      const hasDirtyOrder = orders.some(isDraftMeaningful);
      if (!hasDirtyOrder) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [orders]);

  useEffect(() => {
    const missingCodeOrders = orders.filter(
      (order) => !order.customerOrderInfo.orderCode
    );

    if (missingCodeOrders.length === 0) return;

    missingCodeOrders.forEach((order) => {
      void assignOrderCodeForDraft(order.id);
    });
  }, [orders, assignOrderCodeForDraft]);

  const orderTabs = useMemo(() => {
    return orders.map((item, index) => ({
      id: item.id,
      label: getDraftLabel(item, index),
      itemCount: item.cartItems.length,
      isActive: item.id === activeOrderId,
      hasData: isDraftMeaningful(item),
    }));
  }, [orders, activeOrderId]);

  return {
    orders,
    orderTabs,
    activeOrderId,
    activeOrder,

    setActiveOrderId,
    createNewOrder,
    removeOrder,
    forceRemoveOrder,
    reorderOrders,
    clearActiveOrder,

    cartItems,
    setCartItems,
    shippingFee,
    setShippingFee,
    taxPercent,
    setTaxPercent,
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

    reservedStockMap,
    getReservedQuantity,
    getAvailableStock,

    handleAddOrder,
    handleUpdateOrder,
    addOtherExpense,
    removeCartItem,
    removeProductGroup,
    clearCart,
    resetWholeOrder: clearActiveOrder,
    handleCheckout,
    replaceActiveOrderDraft,
    setWholeOrderForEdit,

    assignOrderCodeForDraft,

    clearPersistedState,
    removePersistedOrderById,
    clearCurrentDraftOnly,
  };
}