import type {
  InventoryProduct,
  OrderProductForm,
  OrderedProduct,
  PriceMode,
} from "../types/order-product.types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function clampWidth(value: number) {
  if (!Number.isFinite(value)) return 120;
  if (value <= 0) return 1;
  return Math.min(value, 120);
}

export function buildPanelSizes(width: number, panelCount: number) {
  const safeCount = Math.max(1, Math.min(3, panelCount));
  const eachPanelSize = Number((width / safeCount).toFixed(2));
  return Array.from({ length: safeCount }, () => eachPanelSize);
}

export function createDefaultOrderForm(
  product?: Partial<InventoryProduct>,
): OrderProductForm {
  return {
    type: "A",
    curving: {
      enabled: false,
      price: 0,
      description: "",
    },
    flatSheet: {
      hasGroove: false,
      panelCount: 1,
      width: 120,
      panelSizes: [120],
    },
    price: product?.retailPrice ?? 0,
    quantity: 1,
    length: 0,
  };
}

export function buildComputedProductName(
  product: Partial<InventoryProduct> | undefined,
  form: OrderProductForm,
) {
  let name = `${product?.name ?? ""}${
    product?.variantCode ? ` (${product.variantCode})` : ""
  }`;

  if (form.type === "B") name += " Sóng Vuông";
  if (form.type === "C") name += " Sóng La Phông";

  if ((form.type === "B" || form.type === "C") && form.curving.enabled) {
    name += " Uốn Vòm";
  }

  if (form.type === "D") {
    const joinedSizes = form.flatSheet.panelSizes.join("x");

    if (form.flatSheet.hasGroove) {
      name += ` (${joinedSizes} - Nhấn Máng)`;
    } else if (form.flatSheet.panelCount > 1) {
      name += ` (Xẻ ${joinedSizes})`;
    } else {
      name += ` (Phẳng Khổ ${form.flatSheet.panelSizes[0]}cm)`;
    }
  }

  return name.trim();
}

export function calculateProfitAmount(
  unitPrice: number,
  product?: Partial<InventoryProduct>,
) {
  return (unitPrice || 0) - (product?.cost || 0);
}

export function calculateComputedUnitPrice(
  form: OrderProductForm,
  priceMode: PriceMode,
) {
  if (form.type === "D" && priceMode !== "C") {
    return Number(((form.flatSheet.width * form.price) / 120).toFixed(2));
  }

  return form.price;
}

export function validateOrderForm(params: {
  product?: Partial<InventoryProduct>;
  form: OrderProductForm;
  computedName: string;
  computedUnitPrice: number;
}) {
  const { product, form, computedName, computedUnitPrice } = params;

  if (!product?.id) {
    return "Không tìm thấy sản phẩm.";
  }

  if (!computedName) {
    return "Tên sản phẩm không hợp lệ.";
  }

  if (form.quantity <= 0) {
    return "Số lượng phải lớn hơn 0.";
  }

  if (form.length < 0) {
    return "Chiều dài không hợp lệ.";
  }

  if (computedUnitPrice < 0) {
    return "Đơn giá không hợp lệ.";
  }

  if ((form.type === "B" || form.type === "C") && form.curving.enabled && form.curving.price < 0) {
    return "Đơn giá uốn vòm không hợp lệ.";
  }

  if (form.type === "D") {
    if (form.flatSheet.width <= 0 || form.flatSheet.width > 120) {
      return "Khổ phải nằm trong khoảng 1 - 120 cm.";
    }

    if (form.flatSheet.panelSizes.some((size) => size <= 0)) {
      return "Kích thước tấm phải lớn hơn 0.";
    }

    const totalPanelSize = form.flatSheet.panelSizes.reduce((sum, size) => sum + size, 0);
    if (Math.abs(totalPanelSize - form.flatSheet.width) > 0.01) {
      return "Tổng kích thước các tấm phải bằng khổ đã chọn.";
    }
  }

  return null;
}

export function buildMainOrder(params: {
  product?: Partial<InventoryProduct>;
  computedName: string;
  unit: string;
  computedUnitPrice: number;
  form: OrderProductForm;
}): OrderedProduct {
  const { product, computedName, unit, computedUnitPrice, form } = params;

  return {
    id: null,
    name: computedName,
    unit,
    price: computedUnitPrice,
    length: form.length || 0,
    quantity: form.quantity || 0,
    productId: product?.id ?? null,
    variantId: product?.variantId ?? null,
  };
}

export function buildCurvingOrder(form: OrderProductForm): OrderedProduct {
  return {
    id: null,
    name: "Công Uốn Vòm",
    unit: "tấm",
    price: form.curving.price || 0,
    length: null,
    quantity: form.quantity || 0,
    productId: null,
    variantId: null,
  };
}