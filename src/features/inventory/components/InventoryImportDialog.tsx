import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InventoryImportRes } from "../types/inventory.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  loading?: boolean;
  result?: InventoryImportRes | null;
};

export function InventoryImportDialog({ open, onClose, onSubmit, loading, result }: Props) {
  const [file, setFile] = useState<File | null>(null);

  const hasErrors = useMemo(() => (result?.errors?.length ?? 0) > 0, [result]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Excel hàng hóa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed p-6 text-center hover:bg-muted/40">
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div>
              <Upload className="mx-auto mb-3 h-8 w-8" />
              <p className="font-medium">Chọn file Excel để import</p>
              <p className="text-sm text-muted-foreground">
                Ưu tiên dùng file đã export từ hệ thống để đảm bảo import đúng dữ liệu.
              </p>
              {file && <p className="mt-2 text-sm">Đã chọn: {file.name}</p>}
            </div>
          </label>

          {result && (
            <div className="space-y-3 rounded-2xl border p-4">
              <p className="font-semibold">Kết quả import</p>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>Tổng dòng: {result.totalRows}</p>
                <p>Tạo sản phẩm: {result.createdProducts}</p>
                <p>Cập nhật sản phẩm: {result.updatedProducts}</p>
                <p>Tạo biến thể: {result.createdVariants}</p>
                <p>Cập nhật biến thể: {result.updatedVariants}</p>
                <p>Tạo lô: {result.createdLots}</p>
                <p>Cập nhật lô: {result.updatedLots}</p>
              </div>

              {result.warnings?.length ? (
                <div>
                  <p className="mb-1 font-medium text-amber-600">Cảnh báo</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.warnings.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {hasErrors ? (
                <div>
                  <p className="mb-1 font-medium text-red-600">Lỗi</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.errors.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button onClick={() => file && onSubmit(file)} disabled={!file || loading}>
            Import file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}