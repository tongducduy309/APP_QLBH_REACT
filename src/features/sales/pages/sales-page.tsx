import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/layout/page-shell";
import {
  createOrder,
  getOrderById,
  updateOrder as updateOrderApi,
} from "@/services/order-api";
import { OrderProductDialog } from "../components/order-product-dialog";
import {
  CustomerPickerDialog,
  CustomerItem,
} from "../components/customer-picker-dialog";
import { ProductSelectorCard } from "../components/ProductSelectorCard";
import { OtherExpenseCard } from "../components/OtherExpenseCard";
import { OrderedItemsCard } from "../components/OrderedItemsCard";
import { CustomerOrderSummaryCard } from "../components/CustomerOrderSummaryCard";
import { PaymentSummaryCard } from "../components/PaymentSummaryCard";
import { CustomerOrderInfoDialog } from "../components/CustomerOrderInfoDialog";
import type {
  OrderCreateReq,
  OrderDetailCreateReq,
  Product,
} from "../types/sales.types";
import { mapInventoryProductsToSalesProducts } from "../utils/sales-mappers";
import { getSellableProductInventories } from "@/services/product-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, GripVertical, X } from "lucide-react";
import { useSalesOrders } from "../hooks/useSalesOrder";
import { mapSalesDraftToOrderRes } from "@/features/print/utils/order-print-mapper";
import { printInvoice } from "@/features/print/services/Invoice-pdf-print.service";
import { downloadQuotation } from "@/features/print/services/Quotation-pdf-print.service";
import { OrderStatus, type OrderUpdateReq } from "@/types/order";
import {
  mapOrderDetailsToCartItems,
  mapOrderToCustomerOrderInfo,
} from "@/features/transactions/utils/order-edit-mapper";
import { Button as AntdButton, Empty, Spin } from "antd";
import { InvoiceCopyImageTemplate } from "@/features/print/components/invoice-copy-image-template";
import { copyElementAsImage } from "@/features/print/utils/copy-invoice-image";
import { Card, CardContent } from "@/components/ui/card";
import { sortOrderResDetails } from "@/utils/order.helper";

const quickExpenseTemplates = [
  { description: "Công uốn", unit: "tấm" },
  { description: "Công nhấn máng", unit: "mét" },
];

type SalesPageProps = {
  mode?: "create" | "edit";
  orderId?: string;
  storageKey?: string;
};

export function SalesPage({
  mode = "create",
  orderId,
  storageKey,
}: SalesPageProps) {
  const isEditMode = mode === "edit" && Boolean(orderId);
  const navigate = useNavigate();

  const sales = useSalesOrders({
    storageKey:
      storageKey ??
      (isEditMode && orderId
        ? `sales-edit-order-draft-${orderId}`
        : undefined),
  });

  const hydratedRef = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerOrderDialogOpen, setCustomerOrderDialogOpen] = useState(false);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [missingCustomerDialogOpen, setMissingCustomerDialogOpen] =
    useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkedPrintInvoice, setCheckedPrintInvoice] = useState(false);
  const [selectedCustomerFromPicker, setSelectedCustomerFromPicker] =
    useState<CustomerItem | null>(null);

  const [closingOrderId, setClosingOrderId] = useState<number | null>(null);
  const [draggingOrderId, setDraggingOrderId] = useState<number | null>(null);
  const [loadingEditOrder, setLoadingEditOrder] = useState(false);

  const [loadEditOrderFailed, setLoadEditOrderFailed] = useState(false);

  const invoiceCopyRef = useRef<HTMLDivElement | null>(null);

  const printableOrder = useMemo(() => {
    if (!sales.activeOrder) return null;

    return mapSalesDraftToOrderRes(sales.activeOrder, {
      taxAmount: sales.taxAmount,
      remainingAmount: sales.remainingAmount,
      changeAmount: sales.changeAmount,
      subtotal: sales.subTotalBeforeTax,
      total: sales.grandTotal,
    });
  }, [
    sales.activeOrder,
    sales.taxAmount,
    sales.remainingAmount,
    sales.changeAmount,
    sales.subTotalBeforeTax,
    sales.grandTotal,
  ]);

  const isCartEmpty = useMemo(() => {
    return sales.orderedDisplayItems.length === 0;
  }, [sales.orderedDisplayItems]);

  const hasCustomerInfo = useMemo(() => {
    return Boolean(
      sales.customerOrderInfo.customerName?.trim() ||
      sales.customerOrderInfo.customerPhone?.trim() ||
      sales.customerOrderInfo.customerAddress?.trim() ||
      sales.customerOrderInfo.customerId
    );
  }, [sales.customerOrderInfo]);

  const fetchProducts = useCallback(async () => {
    try {
      const inventoryProducts = await getSellableProductInventories();
      setProducts(mapInventoryProductsToSalesProducts(inventoryProducts));
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm bán hàng", error);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!isEditMode || !orderId || hydratedRef.current) return;

    const fetchEditOrder = async () => {
      try {
        setLoadingEditOrder(true);
        setLoadEditOrderFailed(false);

        const order = await getOrderById(Number(orderId));

        sales.setWholeOrderForEdit({
          cartItems: mapOrderDetailsToCartItems(sortOrderResDetails(order)),
          shippingFee: Number(order.shippingFee ?? 0),
          taxPercent: Number(order.tax ?? 0),
          paidAmount: Number(order.paidAmount ?? 0),
          customerOrderInfo: mapOrderToCustomerOrderInfo(order),
        });

        setSelectedCustomerFromPicker(
          order.customer
            ? {
              id: order.customer.id ?? null,
              name: order.customer.name ?? "",
              phone: order.customer.phone ?? "",
              address: order.customer.address ?? "",
            }
            : null
        );

        hydratedRef.current = true;
      } catch (error) {
        console.error("Lỗi tải hóa đơn để chỉnh sửa", error);

        hydratedRef.current = false;
        setSelectedCustomerFromPicker(null);
        setLoadEditOrderFailed(true);

        if (orderId) {
          sales.removePersistedOrderById(Number(orderId));
        } else {
          sales.clearPersistedState();
        }

        toast.error("Không thể tải hóa đơn. Hệ thống đã xóa bản nháp lỗi khỏi bộ nhớ.");
      } finally {
        setLoadingEditOrder(false);
      }
    };

    fetchEditOrder();
  }, [isEditMode, orderId]);

  useEffect(() => {
    hydratedRef.current = false;
  }, [orderId]);

  const productsWithAvailableStock = useMemo(() => {

    return products.map((product) => ({
      ...product,
      realStock: product.stock ?? 0,

      stock: sales.getAvailableStock(product),
    })) as Product[];
  }, [products, sales]);

  const openOrderDialog = (product: Product) => {
    sales.setEditingGroupKey(null);
    sales.setSelectedProduct({
      ...product,
      realStock: (product as any).realStock ?? product.stock ?? 0,
      stock: sales.getAvailableStock(product),
    } as Product);
    setDialogOpen(true);
  };

  const handleChooseCustomer = (customer: CustomerItem) => {
    setSelectedCustomerFromPicker(customer);
    setCustomerPickerOpen(false);
  };

  const requestCloseOrder = (orderIdValue: number) => {
    const result = sales.removeOrder(orderIdValue);

    if (result.needConfirm) {
      setClosingOrderId(orderIdValue);
    }
  };

  const confirmCloseOrder = () => {
    if (!closingOrderId) return;
    sales.forceRemoveOrder(closingOrderId);
    setClosingOrderId(null);
  };

  const buildCreatePayload = (status: OrderStatus): OrderCreateReq => {
    const orderDetailCreateReqs: OrderDetailCreateReq[] = sales.cartItems.map(
      (item) => ({
        productVariantId: item.variantId ?? null,
        name: item.name,
        length: item.length ?? 0,
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
        baseUnit: item.unit ?? "",
        inventoryId: item.inventoryId ?? null,
        kind: item.kind,
      })
    );

    return {
      customerId: sales.customerOrderInfo.customerId ?? null,
      nameCustomer: sales.customerOrderInfo.customerName?.trim() || undefined,
      phoneCustomer: sales.customerOrderInfo.customerPhone?.trim() || undefined,
      addressCustomer:
        sales.customerOrderInfo.customerAddress?.trim() || undefined,
      tax: sales.taxPercent ?? 0,
      note: sales.customerOrderInfo.note?.trim() || undefined,
      paidAmount: sales.paidAmount ?? 0,
      shippingFee: sales.shippingFee ?? 0,
      orderDetailCreateReqs,
      createdAt:
        sales.customerOrderInfo.createdDate ? new Date(sales.customerOrderInfo.createdDate).toISOString() : new Date().toISOString(),
      status,
    };
  };

  const buildUpdatePayload = (status: OrderStatus): OrderUpdateReq => {
    return {
      customerId: sales.customerOrderInfo.customerId ?? null,
      nameCustomer: sales.customerOrderInfo.customerName?.trim() || undefined,
      phoneCustomer: sales.customerOrderInfo.customerPhone?.trim() || undefined,
      addressCustomer:
        sales.customerOrderInfo.customerAddress?.trim() || undefined,
      tax: sales.taxPercent ?? 0,
      note: sales.customerOrderInfo.note?.trim() || undefined,
      paidAmount: sales.paidAmount ?? 0,
      shippingFee: sales.shippingFee ?? 0,
      createdAt:
        sales.customerOrderInfo.createdDate ? new Date(sales.customerOrderInfo.createdDate).toISOString() : new Date().toISOString(),
      status,
      orderDetailUpdateReqs: sales.cartItems.map((item) => ({
        id: item.detailId ?? null,
        productVariantId: item.variantId ?? null,
        name: item.name,
        length: item.length ?? 0,
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
        baseUnit: item.unit ?? "",
        inventoryId: item.inventoryId ?? null,
        kind: item.kind,
      })),
    };
  };

  const afterSubmitSuccess = async (
    messageText: string,
    finalOrderId?: string
  ) => {
    if (checkedPrintInvoice && printableOrder) {
      printInvoice(printableOrder);
    }
    // sales.assignOrderCodeForDraft(sales.activeOrderId ?? 0);
    toast.success(messageText);

    await fetchProducts();

    setMissingCustomerDialogOpen(false);
    setCustomerOrderDialogOpen(false);
    setCustomerPickerOpen(false);
    setDialogOpen(false);

    if (isEditMode && finalOrderId) {
      navigate(`/transactions/${finalOrderId}`, { replace: true });
      return;
    }

    const completedId = sales.activeOrderId;
    if (completedId) {
      sales.forceRemoveOrder(completedId);
    }

    setSelectedCustomerFromPicker(null);
  };

  const submitCheckout = async () => {
    if (isCartEmpty) {
      toast.info("Giỏ hàng đang trống.");
      return;
    }

    try {
      setCheckoutLoading(true);

      if (isEditMode && orderId) {
        await updateOrderApi(orderId, buildUpdatePayload(OrderStatus.CONFIRMED));
        await afterSubmitSuccess("Cập nhật hóa đơn thành công.", orderId);
      } else {
        const payload = buildCreatePayload(OrderStatus.CONFIRMED);
        const created = await createOrder(payload);
        await afterSubmitSuccess(
          "Tạo đơn hàng thành công.",
          created.id.toString()
        );
      }

    } catch (error) {
      console.error("Lỗi lưu hóa đơn", error);
      // toast.error(
      //   isEditMode ? "Không thể cập nhật hóa đơn." : "Không thể tạo đơn hàng."
      // );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSaveDraft = useCallback(async () => {
    if (isCartEmpty) {
      toast.info("Giỏ hàng đang trống.");
      return;
    }

    try {
      setCheckoutLoading(true);

      if (isEditMode && orderId) {
        await updateOrderApi(orderId, buildUpdatePayload(OrderStatus.DRAFT));
        await afterSubmitSuccess("Cập nhật bản nháp thành công.", orderId);
      } else {
        const payload = buildCreatePayload(OrderStatus.DRAFT);
        const created = await createOrder(payload);
        await afterSubmitSuccess(
          "Lưu đơn hàng thành công.",
          created.id.toString()
        );
      }
    } catch (error) {
      console.error("Lỗi lưu nháp hóa đơn", error);
      // toast.error(
      //   isEditMode ? "Không thể cập nhật bản nháp." : "Không thể lưu đơn hàng."
      // );
    } finally {
      setCheckoutLoading(false);
    }
  }, [isCartEmpty, isEditMode, orderId, sales.cartItems, sales.customerOrderInfo]);

  const handleCheckoutClick = async () => {
    if (isCartEmpty) {
      toast.info("Giỏ hàng đang trống.");
      return;
    }

    if (!hasCustomerInfo) {
      setMissingCustomerDialogOpen(true);
      return;
    }

    await submitCheckout();
  };

  const handleDownloadQuote = useCallback(() => {
    if (!printableOrder) return;
    downloadQuotation(printableOrder);
  }, [printableOrder]);

  if (loadingEditOrder) {
    return (
      <PageShell>
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
          Đang tải dữ liệu hóa đơn...
        </div>
      </PageShell>
    );
  }

  const handleCopyInvoiceImage = async () => {
    if (!printableOrder || !invoiceCopyRef.current) return;

    try {
      await copyElementAsImage(invoiceCopyRef.current);
      toast.success("Đã copy hóa đơn dưới dạng ảnh");
    } catch (error) {
      console.error("Lỗi copy hóa đơn", error);
      // toast.error("Copy hóa đơn thất bại");
    }
  };

  if (loadingEditOrder && isEditMode) {
    return (
      <PageShell>
        <div className="flex min-h-[300px] items-center justify-center">
          <Spin size="large" />
        </div>
      </PageShell>
    );
  }

  if (loadEditOrderFailed && isEditMode) {
    return (
      <PageShell>
        <Card>
          <CardContent className="py-10">
            <Empty description="Không tìm thấy hóa đơn" />
            <div className="mt-4 flex justify-center">
              <Button onClick={() => navigate("/transactions")}>
                Quay lại lịch sử giao dịch
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-4 bg-white p-4">
        {isEditMode && (
          <AntdButton
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(`/transactions/${orderId}`, { replace: true })}
          >
            Quay lại
          </AntdButton>
        )}

        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          {sales.orderTabs.map((order: any) => (
            <div
              key={order.id}
              draggable={!isEditMode}
              onDragStart={() => !isEditMode && setDraggingOrderId(order.id)}
              onDragOver={(e) => !isEditMode && e.preventDefault()}
              onDrop={() => {
                if (isEditMode || !draggingOrderId) return;
                sales.reorderOrders(draggingOrderId, order.id);
                setDraggingOrderId(null);
              }}
              onDragEnd={() => setDraggingOrderId(null)}
              className={`flex items-center rounded-lg border ${order.isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
                } ${draggingOrderId === order.id ? "opacity-50" : ""}`}
            >
              <button
                type="button"
                className="cursor-grab px-2 text-muted-foreground"
                title="Kéo để sắp xếp"
                disabled={isEditMode}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => sales.setActiveOrderId(order.id)}
                className="px-3 py-2 text-sm font-medium"
              >
                {order.label}
                {order.itemCount > 0 ? ` (${order.itemCount})` : ""}
              </button>

              {order.hasData && (
                <span className="mr-1 h-2 w-2 rounded-full bg-orange-500" />
              )}

              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => requestCloseOrder(order.id)}
                  className="px-2 py-2 text-muted-foreground hover:text-foreground"
                  title="Đóng hóa đơn"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {!isEditMode && (
            <Button type="button" variant="outline" onClick={sales.createNewOrder}>
              + Hóa đơn mới
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ProductSelectorCard
              products={productsWithAvailableStock}
              onOrderProduct={openOrderDialog}
            />

            <OtherExpenseCard
              value={sales.otherExpenseDraft}
              onChange={sales.setOtherExpenseDraft}
              onAdd={sales.addOtherExpense}
              quickExpenseTemplates={quickExpenseTemplates}
            />
          </div>

          <div className="space-y-6">
            <OrderedItemsCard
              items={sales.orderedDisplayItems}
              onEditProduct={(group) => {
                const matchedProduct = group.inventoryId
                  ? products.find(
                    (p) =>
                      (p as any).inventoryId != null &&
                      ((p as any).inventoryId ?? null) === (group.inventoryId ?? null)
                  )
                  : products.find(
                    (p) =>
                      (p.variantId ?? null) === (group.variantId ?? null) ||
                      (p.id ?? null) === (group.productId ?? null)
                  );

                const baseProduct = {
                  id: matchedProduct?.id ?? group.productId ?? null,
                  inventoryId:
                    (matchedProduct as any)?.inventoryId ?? group.inventoryId ?? null,
                  name: matchedProduct?.name ?? group.name,
                  retailPrice: matchedProduct?.retailPrice ?? group.price,
                  storePrice: matchedProduct?.storePrice ?? group.price,
                  cost: matchedProduct?.cost ?? 0,
                  baseUnit: matchedProduct?.baseUnit ?? group.unit ?? "mét",
                  stock: matchedProduct?.stock ?? 0,
                  variantId: matchedProduct?.variantId ?? group.variantId ?? null,
                  variantCode: matchedProduct?.variantCode ?? "",
                } as Product;

                sales.setSelectedProduct({
                  ...baseProduct,
                  realStock: matchedProduct?.stock ?? 0,
                  stock: sales.getAvailableStock(baseProduct, {
                    editingGroupKey: group.groupKey,
                  }),
                } as Product);

                sales.setEditingGroupKey(group.groupKey);
                setDialogOpen(true);
              }}
              onRemoveExpense={sales.removeCartItem}
              onRemoveGroup={sales.removeProductGroup}
            />

            <CustomerOrderSummaryCard
              value={sales.customerOrderInfo}
              onEdit={() => setCustomerOrderDialogOpen(true)}
            />

            <PaymentSummaryCard
              shippingFee={sales.shippingFee}
              taxPercent={sales.taxPercent}
              paidAmount={sales.paidAmount}
              productSubtotal={sales.productSubtotal}
              otherExpenseSubtotal={sales.otherExpenseSubtotal}
              taxAmount={sales.taxAmount}
              grandTotal={sales.grandTotal}
              remainingAmount={sales.remainingAmount}
              changeAmount={sales.changeAmount}
              onChangeShippingFee={sales.setShippingFee}
              onChangeTaxPercent={sales.setTaxPercent}
              onChangePaidAmount={sales.setPaidAmount}
              onReset={sales.resetWholeOrder}
              onCheckout={handleCheckoutClick}
              checkoutDisabled={isCartEmpty || checkoutLoading}
              checkoutLoading={checkoutLoading}
              onDownloadQuote={handleDownloadQuote}
              checkedPrintInvoice={checkedPrintInvoice}
              onCheckedPrintInvoice={setCheckedPrintInvoice}
              onSaveDraft={handleSaveDraft}
              editMode={isEditMode}
              onCopyInvoiceImage={handleCopyInvoiceImage}
            />
          </div>
        </div>

        {isEditMode && (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bạn đang ở chế độ <b>chỉnh sửa hóa đơn</b>. Khi lưu, hệ thống sẽ cập nhật
            hóa đơn hiện tại thay vì tạo hóa đơn mới.
          </div>
        )}
      </div>

      <OrderProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) sales.setEditingGroupKey(null);
        }}
        product={sales.selectedProduct ?? {}}
        editValue={sales.editDialogValue}
        onOrder={
          sales.editingGroupKey ? sales.handleUpdateOrder : sales.handleAddOrder
        }
      />

      <CustomerOrderInfoDialog
        open={customerOrderDialogOpen}
        onClose={() => {
          setCustomerOrderDialogOpen(false);
          if (!isEditMode) {
            setSelectedCustomerFromPicker(null);
          }
        }}
        value={sales.customerOrderInfo}
        onChange={sales.setCustomerOrderInfo}
        onOpenCustomerPicker={() => setCustomerPickerOpen(true)}
        selectedCustomer={selectedCustomerFromPicker}
      />

      <CustomerPickerDialog
        open={customerPickerOpen}
        onOpenChange={setCustomerPickerOpen}
        onChoose={handleChooseCustomer}
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
              Bạn chưa điền thông tin khách hàng. Bạn vẫn muốn tiếp tục thanh toán
              và lưu hóa đơn chứ?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setMissingCustomerDialogOpen(false)}
                disabled={checkoutLoading}
              >
                Quay lại
              </Button>
              <Button onClick={submitCheckout} disabled={checkoutLoading}>
                {checkoutLoading
                  ? isEditMode
                    ? "Đang cập nhật..."
                    : "Đang thanh toán..."
                  : isEditMode
                    ? "Vẫn cập nhật"
                    : "Vẫn tiếp tục"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(closingOrderId)}
        onOpenChange={(open) => {
          if (!open) setClosingOrderId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đóng hóa đơn đang có dữ liệu?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hóa đơn này đang có dữ liệu. Nếu đóng, toàn bộ thông tin của hóa đơn
              này sẽ bị xóa khỏi màn hình bán hàng.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setClosingOrderId(null)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={confirmCloseOrder}>
                Vẫn đóng hóa đơn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div ref={invoiceCopyRef}>
          <InvoiceCopyImageTemplate order={printableOrder} />
        </div>
      </div>
    </PageShell>
  );
}