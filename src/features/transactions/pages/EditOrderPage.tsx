import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import { getAllInventory } from "@/services/product-api";
import { getOrderById, updateOrder } from "@/services/order-api";
import { ProductSelectorCard } from "@/features/sales/components/ProductSelectorCard";
import { OrderProductDialog } from "@/features/sales/components/order-product-dialog";
import type { OrderedProduct } from "@/features/sales/types/order-product.types";
import type { LineKind, Product } from "@/features/sales/types/sales.types";
import { mapInventoryProductsToSalesProducts } from "@/features/sales/utils/sales-mappers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  OrderStatus,
  type OrderRes,
  type OrderDetailRes,
  type OrderUpdateReq,
  type OrderDetailUpdateReq,
} from "@/types/order";
import { printInvoice } from "@/features/print/services/Invoice-pdf-print.service";

type LocalLineKind = "inventory" | "non_inventory" | "expense";

type LocalLine = {
  rowId: string;
  detailId: number | null;
  kind: LocalLineKind;
  name: string;
  unit: string;
  price: number;
  length: number | null;
  quantity: number;
  productId: number | null;
  variantId: number | null;
  inventoryId: number | null;
  lineTotal: number;
};

type DisplayExpenseLine = {
  displayType: "EXPENSE";
  rowId: string;
  detailIds: number[];
  name: string;
  quantity: number;
  unit: string;
  length: number | null;
  price: number;
  lineTotal: number;
};

type DisplayProductGroup = {
  displayType: "INVENTORY" | "NON_INVENTORY";
  groupKey: string;
  detailIds: number[];
  name: string;
  unit: string;
  price: number;
  productId: number | null;
  variantId: number | null;
  inventoryId: number | null;
  sizeLines: Array<{
    detailId: number | null;
    length: number;
    quantity: number;
  }>;
  totalQuantity: number;
  totalAmount: number;
};

type DisplayItem = DisplayExpenseLine | DisplayProductGroup;

type EditableOrderedGroup = {
  name: string;
  unit: string;
  price: number;
  productId: number | null;
  variantId?: number | null;
  inventoryId?: number | null;
  sizeLines: Array<{
    length: number;
    quantity: number;
  }>;
};

const LINE_KIND_LABEL: Record<DisplayItem["displayType"], string> = {
  INVENTORY: "Trong kho",
  NON_INVENTORY: "Ngoài kho",
  EXPENSE: "Chi phí",
};

function createRowId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random()}`;
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toInputDateTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromInputDateTime(value: string) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

function calcLineTotal(
  quantity: number,
  price: number,
  length: number | null,
) {
  return quantity * price * (length && length > 0 ? length : 1);
}

function buildGroupKey(line: LocalLine) {
  return [
    line.kind,
    line.productId ?? "null",
    line.variantId ?? "null",
    line.inventoryId ?? "null",
    line.name,
    line.unit,
    line.price,
  ].join("|");
}

function mapOrderedProductToLocalLine(item: OrderedProduct): LocalLine {
  return {
    rowId: createRowId(),
    detailId: null,
    kind: item.kind as LocalLineKind,
    name: item.name,
    unit: item.unit || "",
    price: toNumber(item.price, 0),
    length: item.length ?? null,
    quantity: toNumber(item.quantity, 0),
    productId: item.productId ?? null,
    variantId: item.variantId ?? null,
    inventoryId: item.inventoryId ?? null,
    lineTotal: calcLineTotal(
      toNumber(item.quantity, 0),
      toNumber(item.price, 0),
      item.length ?? null
    ),
  };
}

function mapOrderDetailToLocalLine(detail: OrderDetailRes): LocalLine {
  return {
    rowId: createRowId(),
    detailId: detail.id ?? null,
    kind: (detail.kind ?? "inventory") as LocalLineKind,
    name: detail.name ?? "",
    unit: detail.baseUnit ?? "",
    price: toNumber(detail.price, 0),
    length: detail.length ?? null,
    quantity: toNumber(detail.quantity, 0),
    productId: null,
    variantId: detail.productVariantId ?? null,
    inventoryId: detail.inventoryId ?? null,
    lineTotal: calcLineTotal(
      toNumber(detail.quantity, 0),
      toNumber(detail.price, 0),
      detail.length ?? null
    ),
  };
}

function buildDisplayItems(lines: LocalLine[]): DisplayItem[] {
  const expenseItems: DisplayExpenseLine[] = [];
  const grouped = new Map<string, DisplayProductGroup>();

  for (const line of lines) {
    if (line.kind === "expense") {
      expenseItems.push({
        displayType: "EXPENSE",
        rowId: line.rowId,
        detailIds: line.detailId != null ? [line.detailId] : [],
        name: line.name,
        quantity: line.quantity,
        unit: line.unit,
        length: line.length,
        price: line.price,
        lineTotal: line.lineTotal,
      });
      continue;
    }

    const displayType = line.kind === "non_inventory" ? "NON_INVENTORY" : "INVENTORY";
    const key = buildGroupKey(line);
    const existing = grouped.get(key);

    const sizeLine = {
      detailId: line.detailId,
      length: toNumber(line.length, 0),
      quantity: toNumber(line.quantity, 0),
    };

    if (!existing) {
      grouped.set(key, {
        displayType,
        groupKey: key,
        detailIds: line.detailId != null ? [line.detailId] : [],
        name: line.name,
        unit: line.unit,
        price: line.price,
        productId: line.productId,
        variantId: line.variantId,
        inventoryId: line.inventoryId,
        sizeLines: [sizeLine],
        totalQuantity:
          toNumber(line.quantity, 0) * (line.length && line.length > 0 ? line.length : 1),
        totalAmount: line.lineTotal,
      });
      continue;
    }

    if (line.detailId != null) {
      existing.detailIds.push(line.detailId);
    }

    existing.sizeLines.push(sizeLine);
    existing.totalQuantity +=
      toNumber(line.quantity, 0) * (line.length && line.length > 0 ? line.length : 1);
    existing.totalAmount += line.lineTotal;
  }

  return [...Array.from(grouped.values()), ...expenseItems];
}

function buildEditValue(group: DisplayProductGroup): EditableOrderedGroup {
  return {
    name: group.name,
    unit: group.unit,
    price: group.price,
    productId: group.productId,
    variantId: group.variantId,
    inventoryId: group.inventoryId,
    sizeLines: group.sizeLines.map((item) => ({
      length: item.length,
      quantity: item.quantity,
    })),
  };
}

function matchProductForGroup(products: Product[], group: DisplayProductGroup): Product | null {
  const byInventory = products.find(
    (p: any) =>
      (p.inventoryId ?? null) === (group.inventoryId ?? null) &&
      (p.variantId ?? null) === (group.variantId ?? null)
  );
  if (byInventory) return byInventory;

  const byVariant = products.find(
    (p) => (p.variantId ?? null) === (group.variantId ?? null)
  );
  if (byVariant) return byVariant;

  const byProduct = products.find((p) => (p.id ?? null) === (group.productId ?? null));
  return byProduct ?? null;
}

export function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderRes | null>(null);

  const [lines, setLines] = useState<LocalLine[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [note, setNote] = useState("");

  const [shippingFee, setShippingFee] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);

  const [checkedPrintInvoice, setCheckedPrintInvoice] = useState(false);

  const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
  const [confirmSaveChecked, setConfirmSaveChecked] = useState(false);
  const [missingCustomerDialogOpen, setMissingCustomerDialogOpen] = useState(false);

  const displayItems = useMemo(() => buildDisplayItems(lines), [lines]);

  const groupedItems = useMemo(
    () => displayItems.filter((item): item is DisplayProductGroup => item.displayType !== "EXPENSE"),
    [displayItems]
  );

  const editingGroup = useMemo(
    () => groupedItems.find((item) => item.groupKey === editingGroupKey) ?? null,
    [groupedItems, editingGroupKey]
  );

  const editValue = useMemo(
    () => (editingGroup ? buildEditValue(editingGroup) : null),
    [editingGroup]
  );

  const productSubtotal = useMemo(() => {
    return lines
      .filter((item) => item.kind === "inventory" || item.kind === "non_inventory")
      .reduce((sum, item) => sum + item.lineTotal, 0);
  }, [lines]);

  const otherExpenseSubtotal = useMemo(() => {
    return lines
      .filter((item) => item.kind === "expense")
      .reduce((sum, item) => sum + item.lineTotal, 0);
  }, [lines]);

  const subTotalBeforeTax = useMemo(() => {
    return productSubtotal + otherExpenseSubtotal + shippingFee;
  }, [productSubtotal, otherExpenseSubtotal, shippingFee]);

  const taxAmount = useMemo(() => {
    return (subTotalBeforeTax * taxPercent) / 100;
  }, [subTotalBeforeTax, taxPercent]);

  const grandTotal = useMemo(() => {
    return subTotalBeforeTax + taxAmount;
  }, [subTotalBeforeTax, taxAmount]);

  const remainingAmount = useMemo(() => {
    return Math.max(grandTotal - paidAmount, 0);
  }, [grandTotal, paidAmount]);

  const changeAmount = useMemo(() => {
    return Math.max(paidAmount - grandTotal, 0);
  }, [grandTotal, paidAmount]);

  const isCartEmpty = lines.length === 0;

  const printableOrder = useMemo(() => {
    return {
      id: order?.id ?? "",
      code: order?.code ?? "",
      customer: {
        id: customerId ?? 0,
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      },
      note,
      tax: taxAmount,
      taxAmount,
      paidAmount,
      remainingAmount,
      shippingFee,
      subtotal: subTotalBeforeTax,
      paidDept: 0,
      changeAmount,
      total: grandTotal,
      details: lines.map((line, index) => ({
        id: line.detailId ?? index + 1,
        length: line.length ?? 0,
        quantity: line.quantity,
        price: line.price,
        totalQuantity: line.quantity * (line.length && line.length > 0 ? line.length : 1),
        inventoryId: line.inventoryId,
        sku: "",
        name: line.name,
        kind: line.kind as LineKind,
        productVariantId: line.variantId ?? 0,
        baseUnit: line.unit,
        index,
      })),
      createdAt: createdAt || new Date().toISOString(),
      status: OrderStatus.CONFIRMED,
    } as OrderRes;
  }, [
    order,
    customerId,
    customerName,
    customerPhone,
    customerAddress,
    note,
    taxAmount,
    paidAmount,
    remainingAmount,
    shippingFee,
    subTotalBeforeTax,
    changeAmount,
    grandTotal,
    lines,
    createdAt,
  ]);

  const fetchProducts = useCallback(async () => {
    const inventoryProducts = await getAllInventory();
    return mapInventoryProductsToSalesProducts(inventoryProducts);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!id) {
        toast.error("Không tìm thấy mã hóa đơn.");
        navigate("/transactions");
        return;
      }

      try {
        setPageLoading(true);

        const [orderRes, productRes] = await Promise.all([
          getOrderById(id),
          fetchProducts(),
        ]);

        setOrder(orderRes);
        setProducts(productRes);

        setCustomerId(orderRes.customer?.id ?? null);
        setCustomerName(orderRes.customer?.name ?? "");
        setCustomerPhone(orderRes.customer?.phone ?? "");
        setCustomerAddress(orderRes.customer?.address ?? "");
        setCreatedAt(orderRes.createdAt ?? new Date().toISOString());
        setNote(orderRes.note ?? "");
        setShippingFee(toNumber(orderRes.shippingFee, 0));
        setPaidAmount(toNumber(orderRes.paidAmount, 0));

        const nextTaxPercent =
          orderRes.subtotal && orderRes.taxAmount
            ? (toNumber(orderRes.taxAmount, 0) / toNumber(orderRes.subtotal, 0)) * 100
            : 0;

        setTaxPercent(Number.isFinite(nextTaxPercent) ? nextTaxPercent : 0);
        setLines((orderRes.details ?? []).map(mapOrderDetailToLocalLine));
      } catch (error) {
        console.error("Lỗi tải dữ liệu hóa đơn", error);
        toast.error("Không thể tải dữ liệu hóa đơn.");
        navigate("/transactions");
      } finally {
        setPageLoading(false);
      }
    };

    bootstrap();
  }, [id, navigate, fetchProducts]);

  const openAddDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setEditingGroupKey(null);
    setDialogOpen(true);
  }, []);

  const handleOrderDialogSubmit = useCallback(
    (orders: OrderedProduct[]) => {
      const mapped = orders.map(mapOrderedProductToLocalLine);

      setLines((prev) => {
        if (!editingGroupKey || !editingGroup) {
          return [...prev, ...mapped];
        }

        const oldDetailIds = editingGroup.sizeLines
          .map((item) => item.detailId)
          .filter((value): value is number => value != null);

        const mappedWithIds = mapped.map((item, index) => ({
          ...item,
          detailId: oldDetailIds[index] ?? null,
        }));

        return [
          ...prev.filter((item) => buildGroupKey(item) !== editingGroupKey),
          ...mappedWithIds,
        ];
      });

      setEditingGroupKey(null);
    },
    [editingGroupKey, editingGroup]
  );

  const handleEditGroup = useCallback(
    (group: DisplayProductGroup) => {
      const matchedProduct = matchProductForGroup(products, group);

      setSelectedProduct(
        matchedProduct
          ? matchedProduct
          : ({
              id: group.productId ?? null,
              inventoryId: group.inventoryId ?? null,
              variantId: group.variantId ?? null,
              name: group.name,
              retailPrice: group.price,
              storePrice: group.price,
              baseUnit: group.unit,
              stock: 0,
              variantCode: "",
              cost: 0,
            } as unknown as Product)
      );

      setEditingGroupKey(group.groupKey);
      setDialogOpen(true);
    },
    [products]
  );

  const handleRemoveExpense = useCallback((rowId: string) => {
    setLines((prev) => prev.filter((item) => item.rowId !== rowId));
  }, []);

  const handleRemoveGroup = useCallback((groupKey: string) => {
    setLines((prev) => prev.filter((item) => buildGroupKey(item) !== groupKey));
  }, []);

  const buildPayload = useCallback(
    (status: OrderStatus): OrderUpdateReq => {
      const orderDetailUpdateReqs: OrderDetailUpdateReq[] = lines.map((line) => ({
        id: line.detailId,
        kind: line.kind as LineKind,
        productVariantId: line.variantId ?? null,
        inventoryId: line.inventoryId ?? null,
        name: line.name?.trim() || undefined,
        baseUnit: line.unit?.trim() || undefined,
        quantity: toNumber(line.quantity, 0),
        length: toNumber(line.length, 0),
        price: toNumber(line.price, 0),
      }));

      return {
        customerId,
        nameCustomer: customerName.trim() || undefined,
        phoneCustomer: customerPhone.trim() || undefined,
        addressCustomer: customerAddress.trim() || undefined,
        tax: taxAmount,
        note: note.trim() || undefined,
        paidAmount: toNumber(paidAmount, 0),
        shippingFee: toNumber(shippingFee, 0),
        orderDetailUpdateReqs,
        createdAt: createdAt || new Date().toISOString(),
        status,
      };
    },
    [
      lines,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      taxAmount,
      note,
      paidAmount,
      shippingFee,
      createdAt,
    ]
  );

  const submitUpdate = useCallback(
    async (status: OrderStatus) => {
      if (!id) {
        toast.error("Không tìm thấy mã hóa đơn.");
        return;
      }

      if (isCartEmpty) {
        toast.error("Chưa có sản phẩm trong hóa đơn.");
        return;
      }

      try {
        setSaving(true);
        const payload = buildPayload(status);
        await updateOrder(id, payload);

        if (checkedPrintInvoice) {
          printInvoice(printableOrder, {
            paperSize: "A4",
            pageOrientation: "portrait",
          });
        }

        toast.success(
          status === OrderStatus.DRAFT
            ? "Đã lưu bản nháp hóa đơn."
            : "Đã cập nhật hóa đơn."
        );

        navigate(`/transactions/${id}`);
      } catch (error) {
        console.error("Lỗi cập nhật hóa đơn", error);
        toast.error("Không thể cập nhật hóa đơn.");
      } finally {
        setSaving(false);
      }
    },
    [id, isCartEmpty, buildPayload, checkedPrintInvoice, printableOrder, navigate]
  );

  const handleSaveDraft = useCallback(async () => {
    await submitUpdate(OrderStatus.DRAFT);
  }, [submitUpdate]);

  const handleOpenConfirmSave = useCallback(() => {
    if (isCartEmpty) {
      toast.error("Chưa có sản phẩm trong hóa đơn.");
      return;
    }

    if (!customerName.trim() && !customerPhone.trim() && !customerAddress.trim() && !customerId) {
      setMissingCustomerDialogOpen(true);
      return;
    }

    setConfirmSaveChecked(false);
    setConfirmSaveDialogOpen(true);
  }, [isCartEmpty, customerName, customerPhone, customerAddress, customerId]);

  const handleConfirmSave = useCallback(async () => {
    if (!confirmSaveChecked) {
      toast.error("Bạn cần xác nhận trước khi lưu hóa đơn.");
      return;
    }

    setConfirmSaveDialogOpen(false);
    await submitUpdate(OrderStatus.CONFIRMED);
  }, [confirmSaveChecked, submitUpdate]);

  if (pageLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[420px] items-center justify-center text-sm text-muted-foreground">
          Đang tải dữ liệu hóa đơn...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Chỉnh sửa hóa đơn</h1>
            <p className="text-sm text-muted-foreground">
              {order?.code ? `Đang chỉnh sửa hóa đơn ${order.code}` : "Cập nhật hóa đơn"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu nháp"}
            </Button>
            <Button onClick={handleOpenConfirmSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu hóa đơn"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border p-4">
              <h2 className="mb-4 text-lg font-semibold">Chọn sản phẩm</h2>
              <ProductSelectorCard products={products} onOrderProduct={openAddDialog} />
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white">
              <div className="border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Danh sách đã chọn</p>
                    <p className="text-sm text-muted-foreground">
                      Bao gồm sản phẩm và các chi phí khác trong đơn
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p>
                      Tổng dòng: <strong>{displayItems.length}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {displayItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Chưa có sản phẩm nào trong đơn. Hãy bấm <strong>Đặt hàng</strong>.
                </div>
              ) : (
                <div className="max-h-[60vh] divide-y overflow-y-auto">
                  {displayItems.map((line, index) => {
                    if (line.displayType === "EXPENSE") {
                      return (
                        <div
                          key={line.rowId}
                          className="grid gap-3 px-4 py-3 md:grid-cols-[72px,1fr,150px,160px]"
                        >
                          <div className="text-sm text-muted-foreground">Dòng {index + 1}</div>

                          <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p className="font-medium">{line.name}</p>
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                {LINE_KIND_LABEL[line.displayType]}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                              <p>
                                Số lượng: <strong>{line.quantity}</strong>
                              </p>
                              <p>
                                Đơn vị: <strong>{line.unit || "-"}</strong>
                              </p>
                              {line.length && line.length > 0 ? (
                                <p>
                                  Chiều dài: <strong>{line.length}</strong>
                                </p>
                              ) : null}
                              <p>
                                Đơn giá: <strong>{formatCurrency(line.price || 0)}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <p className="text-sm text-muted-foreground">Thành tiền</p>
                            <p className="font-semibold">{formatCurrency(line.lineTotal)}</p>
                          </div>

                          <div className="flex items-start justify-start gap-2 md:justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExpense(line.rowId)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={line.groupKey}
                        className="grid gap-3 px-4 py-3 md:grid-cols-[72px,1fr,150px,160px]"
                      >
                        <div className="text-sm text-muted-foreground">Dòng {index + 1}</div>

                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <p className="font-medium">{line.name}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                line.displayType === "NON_INVENTORY"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {LINE_KIND_LABEL[line.displayType]}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm">
                            <p>
                              Kích thước đã chọn:{" "}
                              <strong>
                                {line.sizeLines
                                  .map((item) => `${item.length}m x ${item.quantity}`)
                                  .join(", ")}
                              </strong>
                            </p>

                            <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                              <p>
                                Tổng số lượng: <strong>{line.totalQuantity}</strong>
                              </p>
                              <p>
                                Đơn vị: <strong>{line.unit || "-"}</strong>
                              </p>
                              <p>
                                Số kích thước: <strong>{line.sizeLines.length}</strong>
                              </p>
                              <p>
                                Đơn giá: <strong>{formatCurrency(line.price || 0)}</strong>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-sm text-muted-foreground">Thành tiền</p>
                          <p className="font-semibold">{formatCurrency(line.totalAmount)}</p>
                        </div>

                        <div className="flex items-start justify-start gap-2 md:justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEditGroup(line)}>
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGroup(line.groupKey)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-4">
              <h2 className="mb-4 text-lg font-semibold">Thông tin khách hàng</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên khách hàng</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày tạo</label>
                  <Input
                    type="datetime-local"
                    value={toInputDateTime(createdAt)}
                    onChange={(e) => setCreatedAt(fromInputDateTime(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ghi chú</label>
                  <textarea
                    className="min-h-[96px] w-full rounded-md border px-3 py-2 text-sm outline-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <h2 className="mb-4 text-lg font-semibold">Thanh toán</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phí vận chuyển</label>
                  <Input
                    type="number"
                    min={0}
                    value={shippingFee}
                    onChange={(e) => setShippingFee(toNumber(e.target.value, 0))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Thuế (%)</label>
                  <Input
                    type="number"
                    min={0}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(toNumber(e.target.value, 0))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Khách thanh toán</label>
                  <Input
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(toNumber(e.target.value, 0))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <h2 className="mb-4 text-lg font-semibold">Tổng kết hóa đơn</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiền hàng</span>
                  <span className="font-medium">{formatCurrency(productSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chi phí khác</span>
                  <span className="font-medium">{formatCurrency(otherExpenseSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-medium">{formatCurrency(shippingFee)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thuế ({taxPercent}%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Tổng thanh toán</span>
                  <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Đã thanh toán</span>
                  <span className="font-medium">{formatCurrency(paidAmount)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Còn lại</span>
                  <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiền thừa</span>
                  <span className="font-medium">{formatCurrency(changeAmount)}</span>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-md border bg-white px-3 py-3">
                <Checkbox
                  checked={checkedPrintInvoice}
                  onCheckedChange={(checked) => setCheckedPrintInvoice(Boolean(checked))}
                />
                <span className="text-sm">In hóa đơn sau khi lưu</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <OrderProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingGroupKey(null);
          }
        }}
        product={selectedProduct ?? {}}
        editValue={editValue}
        onOrder={handleOrderDialogSubmit}
      />

      <Dialog
        open={missingCustomerDialogOpen}
        onOpenChange={setMissingCustomerDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chưa có thông tin khách hàng</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn chưa điền thông tin khách hàng. Bạn vẫn muốn tiếp tục cập nhật
              hóa đơn chứ?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setMissingCustomerDialogOpen(false)}
                disabled={saving}
              >
                Quay lại
              </Button>
              <Button
                onClick={() => {
                  setMissingCustomerDialogOpen(false);
                  setConfirmSaveChecked(false);
                  setConfirmSaveDialogOpen(true);
                }}
                disabled={saving}
              >
                {saving ? "Đang cập nhật..." : "Vẫn tiếp tục"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmSaveDialogOpen}
        onOpenChange={(open) => {
          setConfirmSaveDialogOpen(open);
          if (!open) {
            setConfirmSaveChecked(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận lưu hóa đơn</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có muốn cập nhật lại thông tin của hóa đơn này không? Sau khi lưu,
              dữ liệu hiện tại sẽ ghi đè lên hóa đơn cũ.
            </p>

            <label className="flex items-start gap-3 rounded-md border px-3 py-3">
              <Checkbox
                checked={confirmSaveChecked}
                onCheckedChange={(checked) =>
                  setConfirmSaveChecked(Boolean(checked))
                }
              />
              <span className="text-sm">
                Tôi xác nhận muốn cập nhật hóa đơn này.
              </span>
            </label>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmSaveDialogOpen(false);
                  setConfirmSaveChecked(false);
                }}
                disabled={saving}
              >
                Hủy
              </Button>

              <Button
                onClick={handleConfirmSave}
                disabled={!confirmSaveChecked || saving}
              >
                {saving ? "Đang lưu hóa đơn..." : "Xác nhận lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

export default EditOrderPage;