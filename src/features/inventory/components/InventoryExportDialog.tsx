import { Checkbox } from "antd";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { INVENTORY_EXPORT_COLUMNS } from "../constants/inventory-export-columns";
import type { InventoryExportColumnKey } from "../types/inventory.types";

type Props = {
  open: boolean;
  selectedColumns: InventoryExportColumnKey[];
  onClose: () => void;
  onChange: (columns: InventoryExportColumnKey[]) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export function InventoryExportDialog({
  open,
  selectedColumns,
  onClose,
  onChange,
  onSubmit,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Xuất Excel hàng hóa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chọn các cột muốn hiển thị trong file Excel. Hệ thống sẽ tự thêm các cột kỹ thuật ẩn
            để file có thể import ngược lại.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {INVENTORY_EXPORT_COLUMNS.map((column) => (
              <label
                key={column.key}
                className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/40"
              >
                <Checkbox
                  checked={selectedColumns.includes(column.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedColumns, column.key]);
                      return;
                    }
                    onChange(selectedColumns.filter((item) => item !== column.key));
                  }}
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={onSubmit} disabled={loading || selectedColumns.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Xuất file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}