import { useEffect, useMemo, useState } from "react";
import { DatePicker, Input, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/services/order-api";
import { formatCurrency } from "@/lib/utils";
import { removeVietnameseTones } from "@/utils/string";
import { OrderRes, OrderStatus } from "@/types/order";
import { formatDateToDDMMYYYY } from "@/utils/date";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const PAGE_SIZE = 6;

export function TransactionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getOrders();
        setOrders(res);
      } catch (error) {
        console.error("Lỗi lấy lịch sử giao dịch", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

  const handleDateRangeChange = (
    dates: null | (Dayjs | null)[]
  ) => {
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

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones((keywordParam || "").trim()),
    [keywordParam]
  );

  const filteredOrders = useMemo(() => {
    const fromDate = fromParam ? dayjs(fromParam, "YYYY-MM-DD") : null;
    const toDate = toParam ? dayjs(toParam, "YYYY-MM-DD") : null;

    return orders.filter((order: OrderRes) => {
      const createdAt = dayjs(order.createdAt, "DD-MM-YYYY");

      const customerName = removeVietnameseTones(order.customer?.name || "");
      const phone = removeVietnameseTones(order.customer?.phone || "");
      const note = removeVietnameseTones(order.note || "");
      const orderCode = removeVietnameseTones(order.code || "");
      const detailsText = removeVietnameseTones(
        (order.details ?? []).map((d) => `${d.name} ${d.sku || ""}`).join(" ")
      );

      const matchesKeyword =
        !normalizedKeyword ||
        customerName.includes(normalizedKeyword) ||
        phone.includes(normalizedKeyword) ||
        note.includes(normalizedKeyword) ||
        orderCode.includes(normalizedKeyword) ||
        detailsText.includes(normalizedKeyword);

      const matchesDate =
        !fromDate ||
        !toDate ||
        (
          createdAt.valueOf() >= fromDate.startOf("day").valueOf() &&
          createdAt.valueOf() <= toDate.endOf("day").valueOf()
        );

      return matchesKeyword && matchesDate;
    });
  }, [orders, normalizedKeyword, fromParam, toParam]);

  const currentPage = Math.max(pageParam || 1, 1);

  const columns: ColumnsType<OrderRes> = [
    {
      title: "Mã giao dịch",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (value: string) => value || "-",
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customer?.name || "Khách lẻ"}</div>
          <div className="text-xs text-muted-foreground">
            {record.customer?.phone || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => formatDateToDDMMYYYY(value),
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 140,
      render: (value: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 140,
      render: (value: number) => (
        <Tag color={(value ?? 0) > 0 ? "red" : "green"}>
          {formatCurrency(value ?? 0)}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 140,
      render: (value: number) => (
        <span className="font-semibold">{formatCurrency(value ?? 0)}</span>
      ),
    },
    {
      title: "Thanh toán",
      key: "paymentStatus",
      width: 160,
      render: (_, record) => {
        const remaining = record.remainingAmount ?? 0;
        const paidAmount = record.paidAmount ?? 0;

        if (remaining <= 0) {
          return <Tag color="green">Đã thanh toán</Tag>;
        }

        if (paidAmount > 0) {
          return <Tag color="orange">Thanh toán một phần</Tag>;
        }

        return <Tag color="red">Chưa thanh toán</Tag>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.status === OrderStatus.CONFIRMED ? "green" : "red"}>
          {record.status === OrderStatus.CONFIRMED ? "Chính thức" : "Bản nháp"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Button
          variant="link"
          onClick={() =>
            navigate(`/transactions/${record.id}${window.location.search}`)
          }
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    updateSearchParams({
      page: pagination.current || 1,
    });
  };

  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>
              Theo dõi các hóa đơn đã tạo từ hệ thống
            </CardDescription>
          </div>

          <Space wrap>
            <Input
              allowClear
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Tìm mã đơn, khách hàng, SĐT, sản phẩm..."
              prefix={<Search className="h-4 w-4" />}
              className="w-[280px]"
            />

            <RangePicker
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </Space>
        </CardHeader>

        <CardContent>
          <Table<OrderRes>
            rowKey="id"
            columns={columns}
            dataSource={filteredOrders}
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: currentPage,
              pageSize: PAGE_SIZE,
              total: filteredOrders.length,
              showSizeChanger: false,
            }}
            scroll={{ x: 1300 }}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  rowKey={(detail) => detail.id}
                  pagination={false}
                  size="small"
                  dataSource={record.details ?? []}
                  columns={[
                    {
                      title: "Tên sản phẩm",
                      dataIndex: "name",
                      key: "name",
                      render: (value: string, detail) => (
                        <div>
                          <div className="font-medium">{value || "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {detail.sku || "-"}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Mã kho",
                      dataIndex: "inventoryCode",
                      key: "inventoryCode",
                      render: (value: string | null) => value ?? "-",
                    },
                    {
                      title: "Chiều dài",
                      dataIndex: "length",
                      key: "length",
                      render: (value: number) => value ?? 0,
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                      render: (value: number) => value ?? 0,
                    },
                    {
                      title: "Tổng số lượng",
                      dataIndex: "totalQuantity",
                      key: "totalQuantity",
                      render: (_: number, detail) =>
                        (detail.quantity ?? 0) * (detail.length || 1),
                    },
                    {
                      title: "Đơn vị",
                      dataIndex: "baseUnit",
                      key: "baseUnit",
                      render: (value: string) => value || "-",
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "price",
                      key: "price",
                      render: (value: number) => formatCurrency(value ?? 0),
                    },
                    {
                      title: "Thành tiền",
                      key: "lineTotal",
                      render: (_, detail) =>
                        formatCurrency(
                          (detail.price ?? 0) *
                          (detail.quantity ?? 0) *
                          (detail.length || 1)
                        ),
                    },
                  ]}
                />
              ),
              rowExpandable: (record) => (record.details?.length ?? 0) > 0,
            }}
            locale={{
              emptyText: "Chưa có giao dịch",
            }}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}