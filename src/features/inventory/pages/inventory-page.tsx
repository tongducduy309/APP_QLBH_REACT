import { PageShell } from "@/components/layout/page-shell";
import { InventoryEditDialog } from "../components/InventoryEditDialog";
import { InventoryStats } from "../components/InventoryStats";
import { InventoryTable } from "../components/InventoryTable";
import { ProductDialog } from "../components/ProductDialog";
import { useInventoryPage } from "../hooks/useInventoryPage";
import { PurchaseReceiptDialog } from "@/features/purchase-receipts/components/PurchaseReceiptDialog";

export function InventoryPage() {
  const inventory = useInventoryPage();

  return (
    <PageShell>
      <InventoryStats
        totalProducts={inventory.totalProducts}
        totalVariantCount={inventory.totalVariantCount}
        lowStockCount={inventory.lowStockCount}
        outOfStockCount={inventory.outOfStockCount}
      />

      <InventoryTable
        items={inventory.inventoryItems}
        onCreate={inventory.openCreateDialog}
        onEditProduct={inventory.openEditDialog}
        onEditInventory={inventory.openEditInventoryDialog}
        onImportStock={inventory.openPurchaseReceiptDialog}
      />

      <ProductDialog
        open={inventory.isProductDialogOpen}
        isEditing={inventory.isEditingProduct}
        value={inventory.form}
        onClose={() => {
          inventory.setIsProductDialogOpen(false);
          inventory.resetForm();
        }}
        onChange={inventory.setForm}
        onAddVariant={inventory.addVariant}
        onRemoveVariant={inventory.removeVariant}
        onUpdateVariant={inventory.updateVariant}
        onSubmit={inventory.handleSubmit}
      />

      <InventoryEditDialog
        open={inventory.isInventoryDialogOpen}
        variantLabel={inventory.editingVariantLabel}
        value={inventory.inventoryEditForm}
        onClose={() => inventory.setIsInventoryDialogOpen(false)}
        onChange={inventory.setInventoryEditForm}
        onSubmit={inventory.handleSaveInventory}
      />

      <PurchaseReceiptDialog
        open={inventory.isPurchaseReceiptDialogOpen}
        variantLabel={inventory.purchaseReceiptVariantLabel}
        value={inventory.purchaseReceiptForm}
        loading={inventory.isSubmittingPurchaseReceipt}
        onClose={() => {
          inventory.setIsPurchaseReceiptDialogOpen(false);
        }}
        onChange={inventory.setPurchaseReceiptForm}
        onSubmit={inventory.handleCreatePurchaseReceipt}
      />
    </PageShell>
  );
}