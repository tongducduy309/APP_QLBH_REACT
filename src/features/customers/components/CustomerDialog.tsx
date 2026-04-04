// src/modules/customers/components/CustomerDialog.tsx

import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerCreateReq } from "../types/customer.types";

type Props = {
  open: boolean;
  title: string;
  submitText: string;
  value: CustomerCreateReq;
  loading?: boolean;
  onChange: (value: CustomerCreateReq) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function CustomerDialog({
  open,
  title,
  submitText,
  value,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  const phoneError = useMemo(() => {
    if (!value.phone) return "";
    const normalized = value.phone.replace(/\s/g, "");
    if (!/^[0-9]{9,11}$/.test(normalized)) {
      return "Số điện thoại không hợp lệ";
    }
    return "";
  }, [value.phone]);

  const emailError = useMemo(() => {
    if (!value.email) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
      return "Email không hợp lệ";
    }
    return "";
  }, [value.email]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!value.name?.trim()) {
      toast.error("Vui lòng nhập tên khách hàng.");
      return;
    }

    if (!value.phone?.trim()) {
      toast.error("Vui lòng nhập số điện thoại.");
      return;
    }

    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    if (emailError) {
      toast.error(emailError);
      return;
    }

    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Nhập thông tin khách hàng
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tên khách hàng *</Label>
              <Input
                value={value.name ?? ""}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại *</Label>
              <Input
                value={value.phone ?? ""}
                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
              {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Địa chỉ</Label>
              <Input
                value={value.address ?? ""}
                onChange={(e) => onChange({ ...value, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={value.email ?? ""}
                onChange={(e) => onChange({ ...value, email: e.target.value })}
                placeholder="Nhập email"
              />
              {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label>Mã số thuế</Label>
              <Input
                value={value.taxCode ?? ""}
                onChange={(e) => onChange({ ...value, taxCode: e.target.value })}
                placeholder="Nhập mã số thuế"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}