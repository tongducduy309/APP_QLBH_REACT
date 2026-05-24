import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BankAccountCreateReq } from "../types/bank.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBankAccount: (payload: BankAccountCreateReq) => void;
  loading?: boolean;
};

const initialFormValue: BankAccountCreateReq = {
  bankCode: "",
  accountNumber: "",
  bankName: "",
  bankAccountName: "",
};

export function AddBankAccountDialog({
  open,
  onOpenChange,
  onAddBankAccount,
  loading = false,
}: Props) {
  const [formValue, setFormValue] = useState<BankAccountCreateReq>(initialFormValue);

  useEffect(() => {
    if (!open) setFormValue(initialFormValue);
  }, [open]);

  const bankCodeError = useMemo(() => {
    if (!formValue.bankCode.trim()) return "Vui lòng nhập mã ngân hàng.";
    return "";
  }, [formValue.bankCode]);

  const bankNameError = useMemo(() => {
    if (!formValue.bankName.trim()) return "Vui lòng nhập tên ngân hàng.";
    return "";
  }, [formValue.bankName]);

  const accountNumberError = useMemo(() => {
    const v = formValue.accountNumber.trim();
    if (!v) return "Vui lòng nhập số tài khoản.";
    if (!/^[0-9]{6,20}$/.test(v)) return "Số tài khoản phải là dãy số (6–20 chữ số).";
    return "";
  }, [formValue.accountNumber]);

  const bankAccountNameError = useMemo(() => {
    if (!formValue.bankAccountName.trim()) return "Vui lòng nhập tên chủ tài khoản.";
    return "";
  }, [formValue.bankAccountName]);

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const handleSubmit = () => {
    if (bankCodeError || bankNameError || accountNumberError || bankAccountNameError) {
      toast.error(bankCodeError || bankNameError || accountNumberError || bankAccountNameError);
      return;
    }

    onAddBankAccount({
      bankCode: formValue.bankCode.trim(),
      bankName: formValue.bankName.trim(),
      accountNumber: formValue.accountNumber.trim(),
      bankAccountName: formValue.bankAccountName.trim(),
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">Thêm tài khoản ngân hàng</h3>
            <p className="text-sm text-muted-foreground">Nhập thông tin để thêm tài khoản mới.</p>
          </div>

          <Button variant="ghost" size="sm" onClick={handleClose}>
            Đóng
          </Button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mã ngân hàng *</Label>
              <Input
                value={formValue.bankCode}
                onChange={(e) => setFormValue({ ...formValue, bankCode: e.target.value })}
                placeholder="Ví dụ: Vietcombank"
              />
              {bankCodeError && <p className="text-xs text-red-500">{bankCodeError}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tên ngân hàng *</Label>
              <Input
                value={formValue.bankName}
                onChange={(e) => setFormValue({ ...formValue, bankName: e.target.value })}
                placeholder="Nhập tên ngân hàng"
              />
              {bankNameError && <p className="text-xs text-red-500">{bankNameError}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Số tài khoản *</Label>
              <Input
                value={formValue.accountNumber}
                onChange={(e) => setFormValue({ ...formValue, accountNumber: e.target.value })}
                placeholder="Nhập số tài khoản"
              />
              {accountNumberError && <p className="text-xs text-red-500">{accountNumberError}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Chủ tài khoản *</Label>
              <Input
                value={formValue.bankAccountName}
                onChange={(e) => setFormValue({ ...formValue, bankAccountName: e.target.value })}
                placeholder="Nhập tên chủ tài khoản"
              />
              {bankAccountNameError && <p className="text-xs text-red-500">{bankAccountNameError}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu tài khoản"}
          </Button>
        </div>
      </div>
    </div>
  );
}
