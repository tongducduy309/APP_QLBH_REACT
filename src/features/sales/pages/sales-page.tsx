import { useCallback, useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { getNextOrderCode, createOrder } from "@/services/order-api";
import {
  InventoryRes,
  OrderProductDialog,
} from "../components/order-product-dialog";
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
import { useSalesOrder } from "../hooks/useSalesOrder";
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

const quickExpenseTemplates = [
  { description: "Công uốn", unit: "tấm" },
  { description: "Công nhấn máng", unit: "mét" },
];

export function SalesPage() {
  const sales = useSalesOrder();

  const [tab, setTab] = useState("Tất cả");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerOrderDialogOpen, setCustomerOrderDialogOpen] = useState(false);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [missingCustomerDialogOpen, setMissingCustomerDialogOpen] =
    useState(false);

  const [selectedCustomerFromPicker, setSelectedCustomerFromPicker] =
    useState<CustomerItem | null>(null);



  const filteredProducts = useMemo(() => {
    if (tab === "Tất cả") return products;
    return products.filter((item) => item.status === tab);
  }, [tab, products]);

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
        setProductsLoading(true);
        const inventoryProducts = await getAllInventory();
        const mappedProducts =
          mapInventoryProductsToSalesProducts(inventoryProducts);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm bán hàng", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    },[]);
  

  useEffect(() => {
    

    fetchProducts();
  }, []);

  const openOrderDialog = (product: Product) => {
    sales.setEditingGroupKey(null);
    sales.setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleChooseCustomer = (customer: CustomerItem) => {
    setSelectedCustomerFromPicker(customer);
    setCustomerPickerOpen(false);
  };

  const handleSaveNewCustomer = async (
    customer: Omit<CustomerItem, "id">
  ) => {
    const newCustomer: CustomerItem = {
      id: Date.now(),
      ...customer,
      groupKey: customer.name?.trim()?.[0]?.toUpperCase() || "#",
    };


    sales.setCustomerOrderInfo((prev) => ({
      ...prev,
      customerName: newCustomer.name,
      customerPhone: newCustomer.phone,
      customerAddress: newCustomer.address,
    }));

    setCustomerPickerOpen(false);
  };

  const buildOrderPayload = (): OrderCreateReq => {
    const orderDetailReqs: OrderDetailCreateReq[] = sales.cartItems.map(
      (item) => ({
        productVariantId: item.variantId ?? null,
        name: item.name,
        length: item.length ?? 0,
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
        baseUnit: item.unit ?? "",
        inventoryId: item.inventoryId ?? null,
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
      orderDetailCreateReqs:orderDetailReqs,
      createdAt:
        sales.customerOrderInfo.createdDate ||
        new Date().toISOString(),
    };
  };

  const submitCheckout = async () => {
    if (isCartEmpty) {
      toast.error("Giỏ hàng đang trống.");
      return;
    }

    try {
      setCheckoutLoading(true);

      const payload = buildOrderPayload();
      const createdOrder = await createOrder(payload);

      toast.success("Tạo đơn hàng thành công.");

      sales.resetWholeOrder();
      fetchProducts();

      const code = await getNextOrderCode().catch(() => "");
      sales.setCustomerOrderInfo({
        customerId: null,
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        orderCode: code,
        createdDate: new Date().toISOString(),
        note: "",
        saveAsNewCustomer: false,
      });
    } catch (error) {
      console.error("Lỗi tạo đơn hàng", error);
      toast.error("Không thể tạo đơn hàng.");
    } finally {
      setCheckoutLoading(false);
      setMissingCustomerDialogOpen(false);
    }
  };

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

  return (
    <PageShell>
      <div className="grid gap-6 bg-white p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <ProductSelectorCard
            tab={tab}
            onTabChange={setTab}
            products={filteredProducts}
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
            discount={sales.discount}
            paidAmount={sales.paidAmount}
            productSubtotal={sales.productSubtotal}
            otherExpenseSubtotal={sales.otherExpenseSubtotal}
            taxAmount={sales.taxAmount}
            grandTotal={sales.grandTotal}
            remainingAmount={sales.remainingAmount}
            changeAmount={sales.changeAmount}
            onChangeShippingFee={sales.setShippingFee}
            onChangeTaxPercent={sales.setTaxPercent}
            onChangeDiscount={sales.setDiscount}
            onChangePaidAmount={sales.setPaidAmount}
            onReset={sales.resetWholeOrder}
            onCheckout={handleCheckoutClick}
            checkoutDisabled={isCartEmpty || checkoutLoading}
            checkoutLoading={checkoutLoading}
          />
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
          sales.editingGroupKey
            ? sales.handleUpdateOrder
            : sales.handleAddOrder
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
        // customers={customers}
        onChoose={handleChooseCustomer}
        // onSaveNew={handleSaveNewCustomer}
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
    </PageShell>
  );
}