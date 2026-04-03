// src/modules/sales/components/CustomerOrderSummaryCard.tsx

import { Button } from "@/components/ui/button";
import type { CustomerOrderInfo } from "../types/sales.types";

type Props = {
  value: CustomerOrderInfo;
  onEdit: () => void;
};

export function CustomerOrderSummaryCard({ value, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="border-b bg-sky-50 px-4 py-3">
        <p className="font-semibold">Thông tin khách hàng & hóa đơn</p>
        <p className="text-sm text-muted-foreground">
          Ngày tạo: {value.createdDate || "-"}
        </p>
      </div>

      <div className="space-y-3 p-4 text-sm">
        <div>
          <span className="text-muted-foreground">Mã hóa đơn: </span>
          <strong>{value.orderCode || "-"}</strong>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Khách hàng: </span>
            <strong>{value.customerName || "-"}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">SĐT: </span>
            <strong>{value.customerPhone || "-"}</strong>
          </div>
        </div>

        <div>
          <span className="text-muted-foreground">Địa chỉ: </span>
          <strong>{value.customerAddress || "-"}</strong>
        </div>

        <div>
          <span className="text-muted-foreground">Ghi chú: </span>
          <strong>{value.note || "-"}</strong>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Chỉnh sửa thông tin
          </Button>
        </div>
      </div>
    </div>
  );
}