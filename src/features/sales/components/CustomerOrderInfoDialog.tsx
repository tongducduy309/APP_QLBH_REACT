// src/modules/sales/components/CustomerOrderInfoDialog.tsx

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CustomerOrderInfo } from "../types/sales.types";
import type { CustomerItem } from "./customer-picker-dialog";
import { DatePicker } from "antd";
import dayjs from "dayjs";

type Props = {
  open: boolean;
  onClose: () => void;
  value: CustomerOrderInfo;
  onChange: (value: CustomerOrderInfo) => void;
  onOpenCustomerPicker: () => void;
  selectedCustomer?: CustomerItem | null;
};

const MAX_NOTE_LENGTH = 250;

const createDraft = (value: CustomerOrderInfo): CustomerOrderInfo => ({
  customerId: value.customerId ?? null,
  customerName: value.customerName ?? "",
  customerPhone: value.customerPhone ?? "",
  customerAddress: value.customerAddress ?? "",
  orderCode: value.orderCode ?? "",
  createdDate: value.createdDate ?? "",
  note: value.note ?? "",
  saveAsNewCustomer: Boolean(value.saveAsNewCustomer),
});

const normalizeValue = (value: CustomerOrderInfo) => ({
  customerId: value.customerId ?? null,
  customerName: (value.customerName ?? "").trim(),
  customerPhone: (value.customerPhone ?? "").trim(),
  customerAddress: (value.customerAddress ?? "").trim(),
  orderCode: (value.orderCode ?? "").trim(),
  createdDate: value.createdDate ?? "",
  note: (value.note ?? "").trim(),
  saveAsNewCustomer: Boolean(value.saveAsNewCustomer),
});

export function CustomerOrderInfoDialog({
  open,
  onClose,
  value,
  onChange,
  onOpenCustomerPicker,
  selectedCustomer,
}: Props) {
  const [draft, setDraft] = useState<CustomerOrderInfo>(createDraft(value));

  useEffect(() => {
    if (open) {
      setDraft(createDraft(value));
    }
  }, [open]);

  useEffect(() => {
    if (!open || !selectedCustomer) return;

    setDraft((prev) => ({
      ...prev,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address,
      saveAsNewCustomer: false,
    }));
  }, [selectedCustomer, open]);

  const hasCustomerId = Boolean(draft.customerId);

  const hasCustomerInfo = Boolean(
    draft.customerId ||
      draft.customerName.trim() ||
      draft.customerPhone.trim() ||
      draft.customerAddress.trim()
  );

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(normalizeValue(draft)) !==
      JSON.stringify(normalizeValue(value))
    );
  }, [draft, value]);

  const handleResetCustomerInfo = () => {
    setDraft((prev) => ({
      ...prev,
      customerId: null,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      saveAsNewCustomer: false,
    }));
  };

  const handleSave = () => {
    if (!isDirty) return;

    onChange({
      ...draft,
      customerName: draft.customerName.trim(),
      customerPhone: draft.customerPhone.trim(),
      customerAddress: draft.customerAddress.trim(),
      orderCode: draft.orderCode.trim(),
      note: draft.note.trim(),
    });

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              Thông tin khách hàng & hóa đơn
            </h2>
            <p className="text-sm text-muted-foreground">
              Chỉnh sửa thông tin hiển thị bên dưới danh sách đã order
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Thông tin khách hàng</h3>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenCustomerPicker}
                >
                  Danh bạ
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCustomerInfo}
                  disabled={!hasCustomerInfo}
                >
                  Xóa
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tên khách hàng</Label>
                <Input
                  value={draft.customerName}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên khách hàng"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Số điện thoại</Label>
                <Input
                  value={draft.customerPhone}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Địa chỉ</Label>
              <Input
                value={draft.customerAddress}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    customerAddress: e.target.value,
                  }))
                }
                placeholder="Nhập địa chỉ"
              />
            </div>

            <label
              htmlFor="save-new-customer"
              className={`inline-flex w-full items-center gap-3 rounded-md border px-3 py-3 text-sm transition-all ${
                hasCustomerId
                  ? "cursor-not-allowed border-muted bg-muted/40 text-muted-foreground"
                  : "cursor-pointer bg-background hover:bg-muted"
              }`}
            >
              <Checkbox
                id="save-new-customer"
                checked={Boolean(draft.saveAsNewCustomer)}
                disabled={hasCustomerId}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({
                    ...prev,
                    saveAsNewCustomer: Boolean(checked),
                  }))
                }
              />
              <div className="flex flex-col">
                <span className="font-medium">Lưu khách mới</span>
                <span className="text-xs text-muted-foreground">
                  Dùng khi bạn nhập khách hàng mới chưa có trong danh bạ
                </span>
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Thông tin hóa đơn</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mã hóa đơn</Label>
                <Input
                  value={draft.orderCode}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      orderCode: e.target.value,
                    }))
                  }
                  placeholder="Nhập mã hóa đơn"
                />
              </div>

              <div className="space-y-2">
  <Label className="text-sm font-medium">Ngày tạo</Label>

  <DatePicker
    className="w-full"
    format="DD/MM/YYYY"
    value={
      draft.createdDate ? dayjs(draft.createdDate) : null
    }
    onChange={(date) => {
      setDraft((prev) => ({
        ...prev,
        createdDate: date?.toISOString() || "",
      }));
    }}
    placeholder="Chọn ngày"
  />
</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Ghi chú</Label>
                <span
                  className={`text-xs ${
                    draft.note.length >= MAX_NOTE_LENGTH
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {draft.note.length}/{MAX_NOTE_LENGTH}
                </span>
              </div>

              <textarea
                className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={draft.note}
                maxLength={MAX_NOTE_LENGTH}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="Ví dụ: giao buổi sáng, lấy hàng trước 10h..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!isDirty}>
            Lưu thông tin
          </Button>
        </div>
      </div>
    </div>
  );
}