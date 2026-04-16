import { useEffect, useMemo, useState } from "react";
import { Descriptions, Empty, Spin, Tag } from "antd";
import { ArrowLeft, Package, ReceiptText, Trash, Warehouse } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import {
  deletePurchaseReceipt,
  getPurchaseReceiptDetail,
} from "@/services/purchase-receipt-api";
import type {
  PurchaseReceiptDetailRes,
  PurchaseReceiptMethod,
} from "../types/purchase-receipt.types";
import { Button as AntButton } from "antd";

function getMethodLabel(method?: PurchaseReceiptMethod) {
  switch (method) {
    case "ADDITIVE":
      return "Cộng dồn tồn kho";
    case "SEPARATE":
      return "Tạo tồn kho riêng";
    default:
      return "-";
  }
}

function getMethodColor(method?: PurchaseReceiptMethod) {
  switch (method) {
    case "ADDITIVE":
      return "blue";
    case "SEPARATE":
      return "purple";
    default:
      return "default";
  }
}

export function PurchaseReceiptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<PurchaseReceiptDetailRes | null>(null);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const receiptId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const openDeleteDialog = () => {
    setDeleteConfirmed(false);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!receiptId || !deleteConfirmed) return;

    try {
      setDeleteLoading(true);
      await deletePurchaseReceipt(receiptId);
      toast.success("Xóa phiếu nhập thành công.");
      setDeleteDialogOpen(false);
      setDeleteConfirmed(false);
      navigate("/purchase-receipts");
    } catch (error) {
      console.error("Lỗi xóa phiếu nhập", error);
      // toast.error("Không thể xóa phiếu nhập kho.");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (!receiptId) {
      toast.info("ID phiếu nhập không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await getPurchaseReceiptDetail(receiptId);
        setData(response);
      } catch (error) {
        console.error("Lỗi tải chi tiết phiếu nhập", error);
        // toast.error("Không thể tải chi tiết phiếu nhập kho.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [receiptId]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[320px] items-center justify-center">
          <Spin size="large" />
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/purchase-receipts')}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>

          <Card className="border-0 shadow-sm">
            <CardContent className="py-16">
              <Empty description="Không tìm thấy phiếu nhập kho." />
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Chi tiết phiếu nhập kho
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi thông tin phiếu nhập, biến thể sản phẩm và lô tồn kho liên kết.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>

            {data.productId ? (
              <Button
                className="gap-2"
                onClick={() => navigate(`/inventory/${data.productId}`)}
              >
                <Warehouse className="h-4 w-4" />
                Xem sản phẩm
              </Button>
            ) : null}

            <AntButton
              danger
              className="gap-2"
              onClick={openDeleteDialog}
            >
              <Trash className="h-4 w-4" />
              Xóa phiếu nhập
            </AntButton>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Mã phiếu nhập</CardDescription>
              <CardTitle className="text-2xl">#{data.id ?? "-"}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Phương thức nhập</CardDescription>
              <CardTitle className="text-lg">
                <Tag color={getMethodColor(data.purchaseReceiptMethod)}>
                  {getMethodLabel(data.purchaseReceiptMethod)}
                </Tag>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Số lượng nhập</CardDescription>
              <CardTitle className="text-2xl">
                {data.totalQuantity ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Giá trị nhập</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(data.cost ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                <CardTitle>Thông tin phiếu nhập</CardTitle>
              </div>
              <CardDescription>
                Dữ liệu chung của chứng từ nhập kho.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Descriptions
                bordered
                column={1}
                size="middle"
                items={[
                  {
                    key: "id",
                    label: "ID phiếu nhập",
                    children: data.id ?? "-",
                  },
                  {
                    key: "createdAt",
                    label: "Ngày tạo",
                    children: data.createdAt,
                  },
                  {
                    key: "method",
                    label: "Phương thức nhập",
                    children: (
                      <Tag color={getMethodColor(data.purchaseReceiptMethod)}>
                        {getMethodLabel(data.purchaseReceiptMethod)}
                      </Tag>
                    ),
                  },
                  {
                    key: "qty",
                    label: "Số lượng nhập",
                    children: data.totalQuantity ?? 0,
                  },
                  {
                    key: "totalCost",
                    label: "Tổng tiền",
                    children: formatCurrency(data.totalCost ?? 0),
                  },
                  {
                    key: "supplier",
                    label: "Nhà cung cấp",
                    children: data.supplier || "-",
                  },
                  {
                    key: "note",
                    label: "Ghi chú",
                    children: data.note || "-",
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle>Thông tin sản phẩm</CardTitle>
              </div>
              <CardDescription>
                Biến thể sản phẩm được nhập trong phiếu này.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Descriptions
                bordered
                column={1}
                size="middle"
                items={[
                  {
                    key: "productName",
                    label: "Tên sản phẩm",
                    children: data.productName || "-",
                  },
                  {
                    key: "variantCode",
                    label: "Mã biến thể",
                    children: data.productVariantCode || "-",
                  },
                  {
                    key: "sku",
                    label: "SKU",
                    children: data.productVariantSKU || "-",
                  },
                  {
                    key: "weight",
                    label: "Trọng lượng",
                    children: data.productVariantWeight || "-",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              <CardTitle>Thông tin lô tồn kho</CardTitle>
            </div>
            <CardDescription>
              Lô tồn kho được liên kết với phiếu nhập này.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              size="middle"
              items={[
                {
                  key: "inventoryCode",
                  label: "Mã kho",
                  children: data.inventoryCode || "-",
                },
                {
                  key: "inventoryOriginalQty",
                  label: "Số lượng gốc",
                  children: data.inventoryOriginalQty ?? 0,
                },
                {
                  key: "inventoryRemainingQty",
                  label: "Số lượng còn lại",
                  children: data.inventoryRemainingQty ?? 0,
                },
                {
                  key: "inventoryCostPrice",
                  label: "Giá vốn",
                  children: formatCurrency(data.inventoryCostPrice ?? 0),
                },
                {
                  key: "inventoryImportedAt",
                  label: "Ngày nhập lô",
                  children: data.inventoryImportedAt,
                },
                {
                  key: "inventoryActive",
                  label: "Trạng thái",
                  children: (
                    <Tag color={data.inventoryActive ? "green" : "red"}>
                      {data.inventoryActive ? "Lưu hành" : "Ngưng sử dụng"}
                    </Tag>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteConfirmed(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phiếu nhập</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa phiếu nhập{" "}
              <span className="font-medium text-foreground">
                #{data.id ?? receiptId}
              </span>
              ? Nếu đồng ý, vui lòng tick vào ô xác nhận bên dưới.
            </p>

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="confirm-delete-purchase-receipt"
                checked={deleteConfirmed}
                onCheckedChange={(checked) =>
                  setDeleteConfirmed(checked === true)
                }
              />
              <label
                htmlFor="confirm-delete-purchase-receipt"
                className="text-sm leading-5"
              >
                Tôi xác nhận muốn xóa phiếu nhập này
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleteConfirmed(false);
                }}
                disabled={deleteLoading}
              >
                Quay lại
              </Button>

              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={!deleteConfirmed || deleteLoading}
              >
                {deleteLoading ? "Đang xóa..." : "Xác nhận xóa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}