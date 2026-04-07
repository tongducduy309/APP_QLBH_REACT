import { useCallback, useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { createOrder } from "@/services/order-api";
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
import { getAllInventory } from "@/services/product-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GripVertical, X } from "lucide-react";
import { useSalesOrders } from "../hooks/useSalesOrder";
import { mapSalesDraftToOrderRes } from "@/features/print/utils/order-print-mapper";
import { printInvoice } from "@/features/print/services/Invoice-pdf-print.service";
import { downloadQuotation } from "@/features/print/services/Quotation-pdf-print.service";
import { OrderStatus } from "@/types/order";

const quickExpenseTemplates = [
  { description: "Công uốn", unit: "tấm" },
  { description: "Công nhấn máng", unit: "mét" },
];

export function SalesPage() {
  const sales = useSalesOrders();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerOrderDialogOpen, setCustomerOrderDialogOpen] = useState(false);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [missingCustomerDialogOpen, setMissingCustomerDialogOpen] =
    useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  // const [productsLoading, setProductsLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkedPrintInvoice, setCheckedPrintInvoice] = useState(false);
  const [selectedCustomerFromPicker, setSelectedCustomerFromPicker] =
    useState<CustomerItem | null>(null);

  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);

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
      // setProductsLoading(true);
      const inventoryProducts = await getAllInventory();
      setProducts(mapInventoryProductsToSalesProducts(inventoryProducts));
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm bán hàng", error);
      setProducts([]);
    } finally {
      // setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openOrderDialog = (product: Product) => {
    sales.setEditingGroupKey(null);
    sales.setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleChooseCustomer = (customer: CustomerItem) => {
    setSelectedCustomerFromPicker(customer);

    sales.setCustomerOrderInfo((prev: any) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name ?? "",
      customerPhone: customer.phone ?? "",
      customerAddress: customer.address ?? "",
    }));

    setCustomerPickerOpen(false);
  };

  const requestCloseOrder = (orderId: string) => {
    const result = sales.removeOrder(orderId);

    if (result.needConfirm) {
      setClosingOrderId(orderId);
    }
  };

  const confirmCloseOrder = () => {
    if (!closingOrderId) return;
    sales.forceRemoveOrder(closingOrderId);
    setClosingOrderId(null);
  };

  const buildOrderPayload = (status: OrderStatus): OrderCreateReq => {
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
      tax: sales.taxAmount ?? 0,
      note: sales.customerOrderInfo.note?.trim() || undefined,
      paidAmount: sales.paidAmount ?? 0,
      shippingFee: sales.shippingFee ?? 0,
      orderDetailCreateReqs,
      createdAt:
        sales.customerOrderInfo.createdDate || new Date().toISOString(),
      status: status,
    };
  };

  const submitCheckout = async () => {
    if (isCartEmpty) {
      toast.error("Giỏ hàng đang trống.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const payload = buildOrderPayload(OrderStatus.CONFIRMED);
      await createOrder(payload);
      if (checkedPrintInvoice) {
        printInvoice(printableOrder!, {
          paperSize: "A4",
          pageOrientation: "portrait",
        });
      }
      toast.success("Tạo đơn hàng thành công.");

      const completedId = sales.activeOrderId;
      if (completedId) {
        sales.forceRemoveOrder(completedId);
      }

      await fetchProducts();

      setMissingCustomerDialogOpen(false);
      setCustomerOrderDialogOpen(false);
      setCustomerPickerOpen(false);
      setDialogOpen(false);
      setSelectedCustomerFromPicker(null);
    } catch (error) {
      console.error("Lỗi tạo đơn hàng", error);
      toast.error("Không thể tạo đơn hàng.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSaveDraft = useCallback(async () => {
    if (isCartEmpty) {
      toast.error("Giỏ hàng đang trống.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const payload = buildOrderPayload(OrderStatus.DRAFT);
      await createOrder(payload);
      toast.success("Lưu đơn hàng thành công.");

      const completedId = sales.activeOrderId;
      if (completedId) {
        sales.forceRemoveOrder(completedId);
      }

      // await fetchProducts();

      setMissingCustomerDialogOpen(false);
      setCustomerOrderDialogOpen(false);
      setCustomerPickerOpen(false);
      setDialogOpen(false);
      setSelectedCustomerFromPicker(null);
    } catch (error) {
      console.error("Lỗi lưu đơn hàng", error);
      toast.error("Không thể lưu đơn hàng.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [isCartEmpty]);

  const handleCheckoutClick = async () => {
    if (isCartEmpty) {
      toast.error("Giỏ hàng đang trống.");
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
    downloadQuotation(printableOrder, {
      paperSize: "A4",
      pageOrientation: "portrait",
    });

  }, [printableOrder]);

  return (
    <PageShell>
      <div className="space-y-4 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          {sales.orderTabs.map((order: any) => (
            <div
              key={order.id}
              draggable
              onDragStart={() => setDraggingOrderId(order.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggingOrderId) return;
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

              {sales.orders.length > 1 && (
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

          <Button type="button" variant="outline" onClick={sales.createNewOrder}>
            + Hóa đơn mới
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ProductSelectorCard
              products={products}
              onOrderProduct={openOrderDialog}
            // loading={productsLoading}
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
                const matchedProduct = products.find(
                  (p) =>
                    p.id === group.productId &&
                    (p.variantId ?? null) === (group.variantId ?? null)
                );

                sales.setSelectedProduct({
                  id: matchedProduct?.id ?? group.productId ?? null,
                  name: matchedProduct?.name ?? group.name,
                  retailPrice: matchedProduct?.retailPrice ?? group.price,
                  storePrice: matchedProduct?.storePrice ?? group.price,
                  cost: matchedProduct?.cost ?? 0,
                  baseUnit: matchedProduct?.baseUnit ?? group.unit ?? "mét",
                  stock: matchedProduct?.stock ?? 0,
                  variantId: matchedProduct?.variantId ?? group.variantId ?? null,
                  variantCode: matchedProduct?.variantCode ?? "",
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
            />
          </div>
        </div>
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
          setSelectedCustomerFromPicker(null);
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
              và tạo đơn hàng chứ?
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
                {checkoutLoading ? "Đang thanh toán..." : "Vẫn tiếp tục"}
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
              <Button
                variant="outline"
                onClick={() => setClosingOrderId(null)}
              >
                Hủy
              </Button>
              <Button variant="destructive" onClick={confirmCloseOrder}>
                Vẫn đóng hóa đơn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}