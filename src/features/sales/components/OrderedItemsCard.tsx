// src/modules/sales/components/OrderedItemsCard.tsx

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  LINE_KIND_LABEL,
  type DisplayExpenseLine,
  type DisplayInventoryGroup,
  type DisplayNonInventoryGroup,
} from "../types/sales.types";

type OrderedItem = DisplayInventoryGroup | DisplayNonInventoryGroup | DisplayExpenseLine;

type Props = {
  items: OrderedItem[];
  onEditProduct: (group: DisplayInventoryGroup | DisplayNonInventoryGroup) => void;
  onRemoveExpense: (rowId: string) => void;
  onRemoveGroup: (groupKey: string) => void;
};

export function OrderedItemsCard({
  items,
  onEditProduct,
  onRemoveExpense,
  onRemoveGroup,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Chưa có sản phẩm nào trong đơn. Hãy bấm <strong>Đặt hàng</strong>.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold ">Danh sách đã chọn</p>
            <p className="text-sm text-muted-foreground">
              Bao gồm sản phẩm và các chi phí khác trong đơn
            </p>
          </div>

          <div className="text-right text-sm">
            <p>
              Tổng dòng: <strong>{items.length}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[50vh] divide-y overflow-y-auto">
        {items.map((line, index) => {
          if (line.displayType === "EXPENSE") {
            return (
              <div
                key={line.rowId}
                className="grid gap-3 px-4 py-3 md:grid-cols-[72px,1fr,150px,160px]"
              >
                <div className="text-sm text-muted-foreground">Dòng {index + 1}</div>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium">{line.name}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {LINE_KIND_LABEL[line.displayType]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                    <p>
                      Số lượng: <strong>{line.quantity}</strong>
                    </p>
                    <p>
                      Đơn vị: <strong>{line.unit || "-"}</strong>
                    </p>
                    {line.length > 0 && (
                      <p>
                        Chiều dài: <strong>{line.length}</strong>
                      </p>
                    )}
                    <p>
                      Đơn giá: <strong>{formatCurrency(line.price || 0)}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-muted-foreground">Thành tiền</p>
                  <p className="font-semibold">{formatCurrency(line.lineTotal)}</p>
                </div>

                <div className="flex items-start justify-start gap-2 md:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveExpense(line.rowId)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={line.groupKey}
              className="grid gap-3 px-4 py-3 md:grid-cols-[72px,1fr,150px,160px]"
            >
              <div className="text-sm text-muted-foreground">Dòng {index + 1}</div>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium">{line.name}</p>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {LINE_KIND_LABEL[line.displayType]}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    Kích thước đã chọn:{" "}
                    <div className="mb-1 flex flex-wrap items-center gap-1">
                      {line.sizeLines.map((item, idx) => (
                        <span
                          key={`${line.groupKey}-${idx}`}
                          className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                        >
                          {item.length ? (`${item.length} mét x `) : ""} {item.quantity} {item.length?"":line.unit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                    <p>
                      Tổng số lượng: <strong>{line.totalQuantity}</strong>
                    </p>
                    <p>
                      Đơn vị: <strong>{line.unit || "-"}</strong>
                    </p>
                    <p>
                      Số kích thước: <strong>{line.sizeLines.length}</strong>
                    </p>
                    <p>
                      Đơn giá: <strong>{formatCurrency(line.price || 0)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground">Thành tiền</p>
                <p className="font-semibold">{formatCurrency(line.totalAmount)}</p>
              </div>

              <div className="flex items-start justify-start gap-2 md:justify-end">
                <Button variant="outline" size="sm" onClick={() => onEditProduct(line)}>
                  Sửa
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveGroup(line.groupKey)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}