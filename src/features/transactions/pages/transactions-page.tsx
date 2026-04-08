import { useEffect, useMemo, useState } from "react";
import { DatePicker, Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrders } from "@/services/order-api";
import { formatCurrency } from "@/lib/utils";
import { removeVietnameseTones } from "@/utils/string";
import { OrderRes, OrderStatus } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const { RangePicker } = DatePicker;

export function TransactionsPage() {
  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const navigate = useNavigate();
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

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones(keyword || ""),
    [keyword]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order: OrderRes) => {
      const customerName = removeVietnameseTones(order.customer?.name || "");
      const phone = removeVietnameseTones(order.customer?.phone || "");
      const note = removeVietnameseTones(order.note || "");
      const orderCode = removeVietnameseTones(order.code || "");
      const detailsText = removeVietnameseTones(
        (order.details ?? []).map((d) => `${d.name} ${d.sku}`).join(" ")
      );

      const matchesKeyword =
        !normalizedKeyword ||
        customerName.includes(normalizedKeyword) ||
        phone.includes(normalizedKeyword) ||
        note.includes(normalizedKeyword) ||
        orderCode.includes(keyword.trim()) ||
        detailsText.includes(normalizedKeyword);

      const matchesDate =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        dayjs(order.createdAt).isBetween(
          dateRange[0].startOf("day"),
          dateRange[1].endOf("day"),
          null,
          "[]"
        );

      return matchesKeyword && matchesDate;
    });
  }, [orders, normalizedKeyword, keyword, dateRange]);

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
          <div className="font-medium">
            {record.customer?.name || "Khách lẻ"}
          </div>
          <div className="text-xs text-muted-foreground">
            {record.customer?.phone || "-"}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Số mặt hàng",
    //   key: "detailsCount",
    //   width: 120,
    //   render: (_, record) => record.details?.length ?? 0,
    // },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => value || "-",
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 120,
      render: (value: number) => formatCurrency(value ?? 0),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 120,
      render: (value: number) => {
        return <Tag color={value > 0 ? "red" : "green"}>{formatCurrency(value ?? 0)}</Tag>
      },
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
      width: 140,
      render: (_, record) => {
        const remaining = record.remainingAmount ?? 0;

        if (remaining <= 0) {
          return <Tag color="green">Đã thanh toán</Tag>;
        }

        if ((record.paidAmount ?? 0) > 0) {
          return <Tag color="orange">Thanh toán một phần</Tag>;
        }

        return <Tag color="red">Chưa thanh toán</Tag>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => {
        return <Tag color={record.status === OrderStatus.CONFIRMED ? "green" : "red"}>{record.status === OrderStatus.CONFIRMED ? "Chính thức" : "Bản nháp"}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Button variant="link" onClick={() => navigate(`/transactions/${record.id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

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
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã đơn, khách hàng, SĐT, sản phẩm..."
              prefix={<Search className="h-4 w-4" />}
              className="w-[280px]"
            />

            <RangePicker
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={(dates) =>
                setDateRange(
                  dates ? [dates[0] ?? null, dates[1] ?? null] : null
                )
              }
            />
          </Space>
        </CardHeader>

        <CardContent>
          <Table<OrderRes>
            rowKey="id"
            columns={columns}
            dataSource={filteredOrders}
            loading={loading}
            pagination={{ pageSize: 6 }}
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
                      key: "variant",
                      render: (_, detail) =>
                        detail.inventoryId || "-",
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
                      render: (_: number, detail) => {
                        return (detail.quantity ?? 0) * (detail.length || 1)
                      },
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