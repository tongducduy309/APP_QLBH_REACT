// src/modules/sales/components/CustomerOrderInfoDialog.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerOrderInfo } from "../types/sales.types";

type Props = {
  open: boolean;
  onClose: () => void;
  value: CustomerOrderInfo;
  onChange: (value: CustomerOrderInfo) => void;
  onOpenCustomerPicker: () => void;
};

export function CustomerOrderInfoDialog({
  open,
  onClose,
  value,
  onChange,
  onOpenCustomerPicker,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Thông tin khách hàng & hóa đơn</h2>
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
            <h3 className="font-medium">Thông tin khách hàng</h3>

            <Button variant="outline" size="sm" onClick={onOpenCustomerPicker}>
              Danh bạ
            </Button>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên khách hàng</label>
                <Input
                  value={value.customerName}
                  onChange={(e) => onChange({ ...value, customerName: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input
                  value={value.customerPhone}
                  onChange={(e) => onChange({ ...value, customerPhone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input
                value={value.customerAddress}
                onChange={(e) => onChange({ ...value, customerAddress: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Thông tin hóa đơn</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mã hóa đơn</label>
                <Input
                  value={value.orderCode}
                  onChange={(e) => onChange({ ...value, orderCode: e.target.value })}
                  placeholder="Nhập mã hóa đơn"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày tạo</label>
                <Input
                  type="date"
                  value={value.createdDate}
                  onChange={(e) => onChange({ ...value, createdDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={value.note}
                onChange={(e) => onChange({ ...value, note: e.target.value })}
                placeholder="Ví dụ: giao buổi sáng, lấy hàng trước 10h..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={onClose}>Lưu thông tin</Button>
        </div>
      </div>
    </div>
  );
}