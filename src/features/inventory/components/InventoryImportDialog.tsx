import { FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImportRes } from "@/types/product";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  loading?: boolean;
  result?: ProductImportRes | null;
};

export function ProductImportDialog({
  open,
  onClose,
  onSubmit,
  loading,
  result,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loadedFile, setLoadedFile] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setLoadedFile(false);
    }
  }, [open]);

  const hasErrors = useMemo(() => (result?.errors?.length ?? 0) > 0, [result]);

  const handleImport = async () => {
    if (!file || loading) return;
    setLoadedFile(true);
    await onSubmit(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setLoadedFile(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nhập Excel sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label
            className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-colors hover:bg-muted/40"
         
          >
            <input
              key={file?.name || "empty"}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files?.[0]) return;
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setLoadedFile(false);

                e.target.value = "";
              }}
            />

            <div className="space-y-2">
              <FileSpreadsheet className="mx-auto h-8 w-8" />

              <p className="font-medium">
                Chọn file Excel để nhập sản phẩm
              </p>

              <p className="text-sm text-muted-foreground">
                File chỉ dùng để nhập <b>sản phẩm</b> và <b>biến thể sản phẩm</b>,
                không nhập tồn kho.
              </p>

              {file ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Đã chọn: {file.name}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa file
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ định dạng .xlsx
                </p>
              )}
            </div>
          </label>

          {result && (
            <div className="space-y-3 rounded-2xl border p-4">
              <p className="font-semibold">Kết quả nhập dữ liệu</p>

              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>Tổng dòng: {result.totalRows}</p>
                <p>Dòng bỏ qua: {result.skippedRows}</p>
                <p>Thêm sản phẩm: {result.createdProducts}</p>
                <p>Đã có sản phẩm: {result.updatedProducts}</p>
                <p>Thêm biến thể: {result.createdVariants}</p>
                <p>Đã có biến thể: {result.updatedVariants}</p>
              </div>

              {hasErrors && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="mb-2 font-medium text-red-600">
                    Lỗi dữ liệu
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                    {result.errors.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Đóng
          </Button>

          <Button
            onClick={handleImport}
            disabled={!file || loading || loadedFile}
          >
            <Upload className="mr-2 h-4 w-4" />
            {loading ? "Đang nhập..." : "Nhập file"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}