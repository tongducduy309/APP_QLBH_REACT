import { useEffect, useMemo, useState } from "react";
import { DatePicker, Form, Space, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import {
  createPurchaseReceipt,
  getPurchaseReceipts,
} from "@/services/purchase-receipt-api";

import type {
  PurchaseReceiptCreateReq,
  PurchaseReceiptMethod,
  PurchaseReceiptRes,
} from "../types/purchase-receipt.types";
import { PurchaseReceiptDialog } from "../components/purchase-receipt-dialog";

dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

type PurchaseReceiptTableRow = PurchaseReceiptRes & {
  key: string;
};

const MAX_NOTE_LENGTH = 250;

const purchaseReceiptMethodOptions: {
  label: string;
  value: PurchaseReceiptMethod;
  description: string;
}[] = [
  {
    label: "Tạo tồn kho riêng",
    value: "SEPARATE",
    description:
      "Dùng cho tôn cuộn hoặc hàng cần theo dõi riêng từng lần nhập.",
  },
];

const initialFormValues: PurchaseReceiptCreateReq = {
  productVariantId: undefined,
  purchaseReceiptMethod: "SEPARATE",
  totalQuantity: undefined,
  cost: undefined,
  totalCost: undefined,
  lotCode: "",
  supplier: "",
  note: "",
};

export function PurchaseReceiptsPage() {
  const [form] = Form.useForm<PurchaseReceiptCreateReq>();

  const [receipts, setReceipts] = useState<PurchaseReceiptRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const navigate = useNavigate();

  const watchedTotalQuantity = Form.useWatch("totalQuantity", form);
  const watchedCost = Form.useWatch("cost", form);
  const watchedTotalCost = Form.useWatch("totalCost", form);
  const watchedNote = Form.useWatch("note", form);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseReceipts();
      setReceipts(data || []);
    } catch (error) {
      console.error("Lỗi tải phiếu nhập", error);
      toast.error("Không thể tải danh sách phiếu nhập.");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const openCreateModal = () => {
    form.setFieldsValue(initialFormValues);
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: PurchaseReceiptCreateReq = {
        productVariantId: values.productVariantId,
        purchaseReceiptMethod: "SEPARATE",
        totalQuantity: values.totalQuantity,
        cost: values.cost,
        totalCost: values.totalCost,
        lotCode: values.lotCode?.trim() || undefined,
        supplier: values.supplier?.trim() || undefined,
        note: values.note?.trim() || undefined,
      };

      setSubmitLoading(true);
      await createPurchaseReceipt(payload);

      toast.success("Tạo phiếu nhập kho thành công.");
      closeCreateModal();
      await fetchReceipts();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) return;

      console.error("Lỗi tạo phiếu nhập", error);
      toast.error("Tạo phiếu nhập kho thất bại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((item) => {
      if (!dateRange || !dateRange[0] || !dateRange[1]) return true;
      if (!item.createdAt) return false;

      return dayjs(item.createdAt).isBetween(
        dateRange[0].startOf("day"),
        dateRange[1].endOf("day"),
        null,
        "[]",
      );
    });
  }, [receipts, dateRange]);

  const totalReceiptValue = useMemo(() => {
    return filteredReceipts.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }, [filteredReceipts]);

  const totalReceiptQuantity = useMemo(() => {
    return filteredReceipts.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  }, [filteredReceipts]);

  

  const columns: ColumnsType<PurchaseReceiptTableRow> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (value: number) => (
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={() => navigate(`/purchase-receipts/${value}`)}
        >
          #{value}
        </button>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (value: string, record) => (
        <div>
          <div
            className="cursor-pointer font-medium hover:underline"
            onClick={() => navigate(`/inventory/${record.productId}`)}
          >
            {value || "-"} {record.productVariantCode ? `(${record.productVariantCode})` : ""}
          </div>
          <div className="text-xs text-muted-foreground">
            SKU: {record.productVariantSKU || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Giá vốn",
      dataIndex: "cost",
      key: "cost",
      render: (value?: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (value?: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      render: (value?: string) => value || "-",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (value?: string) => {
        if (!value) return "-";

        return (
          <Tooltip title={value}>
            <div
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                lineHeight: "1.4em",
                maxHeight: "2.8em",
              }}
            >
              {value}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value?: string) => value || "-",
    },
  ];

  const dataSource: PurchaseReceiptTableRow[] = filteredReceipts.map((item, index) => ({
    ...item,
    key: String(item.id ?? index),
  }));

  return (
    <PageShell>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Phiếu nhập kho</CardTitle>
              <CardDescription>
                Tạo phiếu nhập kho theo kiểu tạo tồn riêng cho từng lô hàng.
              </CardDescription>
            </div>

            <Space wrap>
              <Button type="button" variant="outline" onClick={fetchReceipts}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tải lại
              </Button>

              <Button type="button" onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu nhập
              </Button>
            </Space>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Tổng phiếu nhập</div>
                <div className="mt-2 text-2xl font-semibold">{filteredReceipts.length}</div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Tổng số lượng nhập</div>
                <div className="mt-2 text-2xl font-semibold">{totalReceiptQuantity}</div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Tổng giá trị nhập</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatCurrency(totalReceiptValue)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Danh sách phiếu nhập</CardTitle>
              <CardDescription>
                Theo dõi lịch sử nhập kho của từng lô hàng riêng biệt.
              </CardDescription>
            </div>

            <Space wrap>
              <RangePicker
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(dates ? [dates[0] ?? null, dates[1] ?? null] : null)
                }
                placeholder={["Từ ngày", "Đến ngày"]}
              />

              <Button type="button" variant="outline" onClick={() => setDateRange(null)}>
                Xóa lọc ngày
              </Button>
            </Space>
          </CardHeader>

          <CardContent>
            <Table<PurchaseReceiptTableRow>
              rowKey="key"
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
              locale={{ emptyText: "Chưa có phiếu nhập nào." }}
            />
          </CardContent>
        </Card>
      </div>

      <PurchaseReceiptDialog
        open={createOpen}
        form={form}
        loading={submitLoading}
        inventoryLoading={false}
        watchedTotalQuantity={watchedTotalQuantity}
        watchedCost={watchedCost}
        watchedTotalCost={watchedTotalCost}
        watchedNote={watchedNote}
        maxNoteLength={MAX_NOTE_LENGTH}
        onClose={closeCreateModal}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}