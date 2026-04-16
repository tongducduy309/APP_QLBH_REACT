import { useEffect, useMemo, useState } from "react";
import { DatePicker, Form, Input, Space, Table, Tooltip } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

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
import { removeVietnameseTones } from "@/utils/string";

import {
  createPurchaseReceipt,
  getPurchaseReceipts,
} from "@/services/purchase-receipt-api";

import type {
  PurchaseReceiptCreateReq,
  PurchaseReceiptRes,
} from "../types/purchase-receipt.types";
import { PurchaseReceiptDialog } from "../components/purchase-receipt-dialog";

dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

type PurchaseReceiptTableRow = PurchaseReceiptRes & {
  key: string;
};

const MAX_NOTE_LENGTH = 250;
const PAGE_SIZE = 10;



const initialFormValues: PurchaseReceiptCreateReq = {
  productVariantId: undefined,
  purchaseReceiptMethod: "SEPARATE",
  totalQuantity: undefined,
  cost: undefined,
  totalCost: undefined,
  inventoryCode: "",
  supplier: "",
  note: "",
};

export function PurchaseReceiptsPage() {
  const [form] = Form.useForm<PurchaseReceiptCreateReq>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState<PurchaseReceiptRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const keywordParam = searchParams.get("keyword") || "";
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";
  const pageParam = Number(searchParams.get("page") || "1");

  const [keyword, setKeyword] = useState(keywordParam);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    fromParam || toParam
      ? [
        fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null,
        toParam ? dayjs(toParam, "YYYY-MM-DD") : null,
      ]
      : null
  );

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
      // toast.error("Không thể tải danh sách phiếu nhập.");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    setKeyword(keywordParam);
    setDateRange(
      fromParam || toParam
        ? [
          fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null,
          toParam ? dayjs(toParam, "YYYY-MM-DD") : null,
        ]
        : null
    );
  }, [keywordParam, fromParam, toParam]);

  const updateSearchParams = (next: {
    keyword?: string;
    from?: string;
    to?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams);

    const finalKeyword = next.keyword ?? keywordParam;
    const finalFrom = next.from ?? fromParam;
    const finalTo = next.to ?? toParam;
    const finalPage = next.page ?? pageParam;

    if (finalKeyword?.trim()) {
      params.set("keyword", finalKeyword.trim());
    } else {
      params.delete("keyword");
    }

    if (finalFrom) {
      params.set("from", finalFrom);
    } else {
      params.delete("from");
    }

    if (finalTo) {
      params.set("to", finalTo);
    } else {
      params.delete("to");
    }

    if (finalPage && finalPage > 1) {
      params.set("page", String(finalPage));
    } else {
      params.delete("page");
    }

    setSearchParams(params);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    updateSearchParams({
      keyword: value,
      page: 1,
    });
  };

  const handleDateRangeChange = (dates: null | (Dayjs | null)[]) => {
    const nextRange: [Dayjs | null, Dayjs | null] | null =
      dates && dates.length === 2
        ? [dates[0] ?? null, dates[1] ?? null]
        : null;

    setDateRange(nextRange);

    updateSearchParams({
      from: nextRange?.[0] ? nextRange[0].format("YYYY-MM-DD") : "",
      to: nextRange?.[1] ? nextRange[1].format("YYYY-MM-DD") : "",
      page: 1,
    });
  };

  const clearDateFilter = () => {
    setDateRange(null);
    updateSearchParams({
      from: "",
      to: "",
      page: 1,
    });
  };

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
        inventoryCode: values.inventoryCode?.trim() || undefined,
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
      // toast.error("Tạo phiếu nhập kho thất bại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones((keywordParam || "").trim().toLowerCase()),
    [keywordParam]
  );

  const filteredReceipts = useMemo(() => {
    const fromDate = fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null;
    const toDate = toParam ? dayjs(toParam, "YYYY-MM-DD") : null;

    return receipts.filter((item) => {
      const idText = removeVietnameseTones(String(item.id ?? "").toLowerCase());
      const productName = removeVietnameseTones((item.name || "").toLowerCase());
      const variantCode = removeVietnameseTones(
        (item.productVariantCode || "").toLowerCase()
      );
      const sku = removeVietnameseTones(
        (item.productVariantSKU || "").toLowerCase()
      );
      const supplier = removeVietnameseTones((item.supplier || "").toLowerCase());
      const inventoryCode = removeVietnameseTones((item.inventoryCode || "").toLowerCase());
      const note = removeVietnameseTones((item.note || "").toLowerCase());

      const matchesKeyword =
        !normalizedKeyword ||
        idText.includes(normalizedKeyword) ||
        productName.includes(normalizedKeyword) ||
        variantCode.includes(normalizedKeyword) ||
        sku.includes(normalizedKeyword) ||
        supplier.includes(normalizedKeyword) ||
        inventoryCode.includes(normalizedKeyword) ||
        note.includes(normalizedKeyword);

      const createdAt = item.createdAt ? dayjs(item.createdAt) : null;

      const matchesDate =
        !fromDate ||
        !toDate ||
        (createdAt &&
          createdAt.valueOf() >= fromDate.startOf("day").valueOf() &&
          createdAt.valueOf() <= toDate.endOf("day").valueOf());

      return matchesKeyword && !!matchesDate;
    });
  }, [receipts, normalizedKeyword, fromParam, toParam]);

  const totalReceiptValue = useMemo(() => {
    return filteredReceipts.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }, [filteredReceipts]);

  const totalReceiptQuantity = useMemo(() => {
    return filteredReceipts.reduce(
      (sum, item) => sum + (item.totalQuantity || 0),
      0
    );
  }, [filteredReceipts]);

  const currentPage = Math.max(pageParam || 1, 1);

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
          onClick={() => navigate(`/purchase-receipts/${value}${window.location.search}`)}
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
            onClick={() => navigate(`/inventory/${record.productId}${window.location.search}`)}
          >
            {value || "-"}{" "}
            {record.productVariantCode ? `(${record.productVariantCode})` : ""}
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
      title: "Mã kho",
      dataIndex: "inventoryCode",
      key: "inventoryCode",
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

  const handleTableChange = (pagination: TablePaginationConfig) => {
    updateSearchParams({
      page: pagination.current || 1,
    });
  };

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
              <Input
                allowClear
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="Tìm ID, sản phẩm, mã biến thể, SKU, NCC, ghi chú..."
                prefix={<Search className="h-4 w-4" />}
                className="w-[320px]"
              />

              <RangePicker
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder={["Từ ngày", "Đến ngày"]}
              />

              <Button type="button" variant="outline" onClick={clearDateFilter}>
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
              onChange={handleTableChange}
              pagination={{
                current: currentPage,
                pageSize: PAGE_SIZE,
                total: filteredReceipts.length,
                showSizeChanger: false,
              }}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: keywordParam || fromParam || toParam
                  ? "Không tìm thấy phiếu nhập phù hợp."
                  : "Chưa có phiếu nhập nào.",
              }}
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