import { PageShell } from "@/components/layout/page-shell";
import { InventoryEditDialog } from "../components/InventoryEditDialog";
import { InventoryStats } from "../components/InventoryStats";
import { InventoryTable } from "../components/InventoryTable";
import { ProductDialog } from "../components/ProductDialog";
import { useInventoryPage } from "../hooks/useInventoryPage";
import { PurchaseReceiptDialog } from "@/features/inventory/components/purchase-receipt-dialog-inventory";
import { InventoryExportDialog } from "../components/InventoryExportDialog";
import { InventoryImportDialog } from "../components/InventoryImportDialog";

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
        onExportExcel={inventory.openExportDialog}
        onImportExcel={inventory.openImportDialog}
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

      <InventoryExportDialog
        open={inventory.isExportDialogOpen}
        selectedColumns={inventory.selectedExportColumns}
        onClose={() => inventory.setIsExportDialogOpen(false)}
        onChange={inventory.setSelectedExportColumns}
        onSubmit={inventory.handleExportExcel}
        loading={inventory.isExportingExcel}
      />

      <InventoryImportDialog
        open={inventory.isImportDialogOpen}
        onClose={() => inventory.setIsImportDialogOpen(false)}
        onSubmit={inventory.handleImportExcel}
        loading={inventory.isImportingExcel}
        result={inventory.importResult}
      />
    </PageShell>
  );
}