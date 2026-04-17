import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearAllOrderStorage,
  clearCreateDraftStorage,
  clearEditDraftStorage,
  getOrderStorageSummary,
  type OrderStorageSummary,
} from "../utils/order-storage";


export function OrderStorageCard() {
  const [summary, setSummary] = useState<OrderStorageSummary>({
    items: [],
    totalBytes: 0,
    totalSizeLabel: "0 B",
    totalKeys: 0,
  });

  const refresh = useCallback(() => {
    setSummary(getOrderStorageSummary());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClearAll = () => {
    const removed = clearAllOrderStorage();
    refresh();
    toast.success(`Đã xóa ${removed} mục bộ nhớ liên quan đến hóa đơn.`);
  };

  const handleClearCreate = () => {
    const removed = clearCreateDraftStorage();
    refresh();
    toast.success(
      removed > 0
        ? "Đã xóa nháp bán hàng."
        : "Không có nháp bán hàng để xóa."
    );
  };

  const handleClearEdit = () => {
    const removed = clearEditDraftStorage();
    refresh();
    toast.success(
      removed > 0
        ? `Đã xóa ${removed} nháp chỉnh sửa hóa đơn.`
        : "Không có nháp chỉnh sửa để xóa."
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Bộ nhớ lưu tạm</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quản lý các dữ liệu tạm như nháp bán hàng và nháp chỉnh sửa hóa đơn.
          </p>
        </div>

        <Button variant="outline" onClick={refresh}>
          Làm mới
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Tổng số key</div>
            <div className="mt-1 text-2xl font-semibold">{summary.totalKeys}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Dung lượng ước tính</div>
            <div className="mt-1 text-2xl font-semibold">
              {summary.totalSizeLabel}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Nháp edit</div>
            <div className="mt-1 text-2xl font-semibold">
              {
                summary.items.filter((item) => item.kind === "edit-draft").length
              }
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" onClick={handleClearAll}>
            Xóa toàn bộ bộ nhớ order
          </Button>

          <Button variant="outline" onClick={handleClearCreate}>
            Xóa nháp bán hàng
          </Button>

          <Button variant="outline" onClick={handleClearEdit}>
            Xóa toàn bộ nháp edit
          </Button>
        </div>

        {/* <div className="space-y-2">
          {summary.items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Hiện không có dữ liệu localStorage nào liên quan đến order.
            </div>
          ) : (
            summary.items.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{getKindLabel(item.kind)}</div>
                  <div className="text-muted-foreground">{item.sizeLabel}</div>
                </div>

                <div className="mt-2 space-y-1 text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Key:</span>{" "}
                    {item.key}
                  </div>

                  {item.orderId && (
                    <div>
                      <span className="font-medium text-foreground">Order ID:</span>{" "}
                      {item.orderId}
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-foreground">Cập nhật:</span>{" "}
                    {formatDateTime(item.updatedAt)}
                  </div>

                  <div>
                    <span className="font-medium text-foreground">Hết hạn:</span>{" "}
                    {formatDateTime(item.expiresAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div> */}
      </CardContent>
    </Card>
  );
}