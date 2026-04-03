// src/modules/sales/pages/SalesPage.tsx

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { getNextOrderCode } from "@/services/order-api";
import {
  InventoryRes,
  OrderProductDialog,
} from "../components/order-product-dialog";
import { CustomerPickerDialog, CustomerItem } from "../components/customer-picker-dialog";
import { ProductSelectorCard } from "../components/ProductSelectorCard";
import { OtherExpenseCard } from "../components/OtherExpenseCard";
import { OrderedItemsCard } from "../components/OrderedItemsCard";
import { CustomerOrderSummaryCard } from "../components/CustomerOrderSummaryCard";
import { PaymentSummaryCard } from "../components/PaymentSummaryCard";
import { CustomerOrderInfoDialog } from "../components/CustomerOrderInfoDialog";
import { useSalesOrder } from "../hooks/useSalesOrder";
import type { Product } from "../types/sales.types";

const products: Product[] = [
  {
    id: 1,
    sku: "SP001",
    name: "Tôn lạnh",
    category: "Tôn",
    stock: 24,
    price: 320000,
    retailPrice: 320000,
    storePrice: 300000,
    cost: 260000,
    baseUnit: "mét",
    status: "Còn hàng",
    variantId: 101,
    variantCode: "0.45",
  },
  {
    id: 2,
    sku: "SP002",
    name: "Tôn sóng vuông",
    category: "Tôn",
    stock: 8,
    price: 410000,
    retailPrice: 410000,
    storePrice: 390000,
    cost: 340000,
    baseUnit: "mét",
    status: "Sắp hết",
    variantId: 102,
    variantCode: "0.50",
  },
  {
    id: 3,
    sku: "SP003",
    name: "Tôn phẳng",
    category: "Phụ kiện",
    stock: 0,
    price: 290000,
    retailPrice: 290000,
    storePrice: 270000,
    cost: 220000,
    baseUnit: "mét",
    status: "Hết hàng",
    variantId: 103,
    variantCode: "1.00",
  },
];

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

  const [customers, setCustomers] = useState<CustomerItem[]>([
    {
      id: 1,
      name: "Nguyễn Văn An",
      phone: "0909123456",
      address: "Tam Kỳ, Quảng Nam",
      groupKey: "A",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      phone: "0912345678",
      address: "Hội An, Quảng Nam",
      groupKey: "B",
    },
    {
      id: 3,
      name: "Lê Minh Cường",
      phone: "0988123123",
      address: "Đà Nẵng",
      groupKey: "C",
    },
  ]);

  const filteredProducts = useMemo(() => {
    if (tab === "Tất cả") return products;
    return products.filter((item) => item.status === tab);
  }, [tab]);

  useEffect(() => {
    const fetchOrderCode = async () => {
      try {
        const code = await getNextOrderCode();
        sales.setCustomerOrderInfo((prev) => ({
          ...prev,
          orderCode: code,
        }));
      } catch {}
    };

    fetchOrderCode();
  }, []);

  const openOrderDialog = (product: Product) => {
    sales.setEditingGroupKey(null);
    sales.setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleChooseCustomer = (customer: CustomerItem) => {
    sales.setCustomerOrderInfo((prev) => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
    }));
  };

  const handleSaveNewCustomer = async (
    customer: Omit<CustomerItem, "id">
  ) => {
    const newCustomer: CustomerItem = {
      id: Date.now(),
      ...customer,
      groupKey: customer.name?.trim()?.[0]?.toUpperCase() || "#",
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    sales.setCustomerOrderInfo((prev) => ({
      ...prev,
      customerName: newCustomer.name,
      customerPhone: newCustomer.phone,
      customerAddress: newCustomer.address,
    }));

    setCustomerPickerOpen(false);
  };

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] bg-white p-4">
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

        <div className="space-y-6 ">
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
            onCheckout={() => {
              const payload = sales.handleCheckout();
              console.log("ORDER_PAYLOAD", payload);
            }}
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
        onOrder={sales.editingGroupKey ? sales.handleUpdateOrder : sales.handleAddOrder}
      />

      <CustomerOrderInfoDialog
        open={customerOrderDialogOpen}
        onClose={() => setCustomerOrderDialogOpen(false)}
        value={sales.customerOrderInfo}
        onChange={sales.setCustomerOrderInfo}
        onOpenCustomerPicker={() => setCustomerPickerOpen(true)}
      />

      <CustomerPickerDialog
        open={customerPickerOpen}
        onOpenChange={setCustomerPickerOpen}
        customers={customers}
        onChoose={handleChooseCustomer}
        onSaveNew={handleSaveNewCustomer}
      />
    </PageShell>
  );
}