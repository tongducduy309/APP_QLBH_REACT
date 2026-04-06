import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Descriptions, Empty, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeft, Eye, FileDown, Printer } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { formatDateTime } from "@/utils/date";
import type { OrderDetailRes, OrderRes } from "@/types/order";
import { getOrderById } from "@/services/order-api";
import { downloadInvoice, previewInvoice, printInvoice } from "@/features/print/services/Invoice-pdf-print.service";

export function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderRes | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const res = await getOrderById(id);
                setOrder(res);
            } catch (error) {
                console.error("Lỗi lấy chi tiết hóa đơn", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const paymentStatus = useMemo(() => {
        if (!order) return null;

        const remaining = order.remainingAmount ?? 0;
        const paid = order.paidAmount ?? 0;

        if (remaining <= 0) {
            return <Tag color="green">Đã thanh toán</Tag>;
        }

        if (paid > 0) {
            return <Tag color="orange">Thanh toán một phần</Tag>;
        }

        return <Tag color="red">Chưa thanh toán</Tag>;
    }, [order]);

    const handleViewOrder = () => {
        if (!order) return;
        previewInvoice(order);
    };

    const handlePrintOrder = () => {
        if (!order) return;
        printInvoice(order);
    };

    const handleDownloadOrder = () => {
        if (!order) return;
        downloadInvoice(order);
    };

    const detailColumns: ColumnsType<OrderDetailRes> = [
        {
            title: "STT",
            key: "index",
            width: 70,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Sản phẩm",
            dataIndex: "name",
            key: "name",
            render: (value: string, record) => (
                <div>
                    <div className="font-medium">{value || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                        SKU: {record.sku || "-"}
                    </div>
                </div>
            ),
        },
        {
            title: "Mã kho",
            dataIndex: "inventoryId",
            key: "inventoryId",
            width: 120,
            render: (value: number | null) => value ?? "-",
        },
        {
            title: "Chiều dài",
            dataIndex: "length",
            key: "length",
            width: 100,
            render: (value: number) => value ?? 0,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            render: (value: number) => value ?? 0,
        },
        {
            title: "Tổng SL",
            dataIndex: "totalQuantity",
            key: "totalQuantity",
            width: 120,
            render: (_: number, record) =>
                (record.quantity ?? 0) * (record.length || 1),
        },
        {
            title: "Đơn vị",
            dataIndex: "baseUnit",
            key: "baseUnit",
            width: 100,
            render: (value: string) => value || "-",
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            width: 140,
            render: (value: number) => formatCurrency(value ?? 0),
        },
        {
            title: "Thành tiền",
            key: "lineTotal",
            width: 150,
            render: (_, record) =>
                formatCurrency(
                    (record.price ?? 0) * (record.quantity ?? 0) * (record.length || 1)
                ),
        },
    ];

    if (loading) {
        return (
            <PageShell>
                <div className="flex min-h-[300px] items-center justify-center">
                    <Spin size="large" />
                </div>
            </PageShell>
        );
    }

    if (!order) {
        return (
            <PageShell>
                <Card>
                    <CardContent className="py-10">
                        <Empty description="Không tìm thấy hóa đơn" />
                        <div className="mt-4 flex justify-center">
                            <Button onClick={() => navigate("/transactions")}>
                                Quay lại lịch sử giao dịch
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">Chi tiết hóa đơn</h1>
                        <p className="text-sm text-muted-foreground">
                            Theo dõi thông tin đầy đủ của hóa đơn {order.code}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button icon={<FileDown className="h-4 w-4" />} onClick={handleDownloadOrder}>
                        Tải hóa đơn
                    </Button>

                    <Button icon={<Eye className="h-4 w-4" />} onClick={handleViewOrder}>
                        Xem hóa đơn
                    </Button>

                    <Button icon={<Printer className="h-4 w-4" />} onClick={handlePrintOrder}>
                        In hóa đơn
                    </Button>
                </div>


            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Thông tin hóa đơn</CardTitle>
                        <CardDescription>Thông tin chung của giao dịch</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Descriptions column={2} bordered size="middle">
                            <Descriptions.Item label="Mã hóa đơn">
                                {order.code || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {formatDateTime(order.createdAt) || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {order.customer?.name || "Khách lẻ"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {order.customer?.phone || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {order.customer?.address || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                {paymentStatus}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                {order.note || "-"}
                            </Descriptions.Item>
                        </Descriptions>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tổng kết thanh toán</CardTitle>
                        <CardDescription>Thông tin tiền của hóa đơn</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span>Tạm tính</span>
                                <span className="font-medium">
                                    {formatCurrency(order.subtotal ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Thuế</span>
                                <span className="font-medium">
                                    {formatCurrency(order.taxAmount ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Phí vận chuyển</span>
                                <span className="font-medium">
                                    {formatCurrency(order.shippingFee ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Đã trả nợ cũ</span>
                                <span className="font-medium">
                                    {formatCurrency(order.paidDept ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(order.total ?? 0)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Khách đưa</span>
                                <span className="font-medium">
                                    {formatCurrency(order.paidAmount ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Tiền thừa</span>
                                <span className="font-medium">
                                    {formatCurrency(order.changeAmount ?? 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Còn lại</span>
                                <span className="font-medium text-red-500">
                                    {formatCurrency(order.remainingAmount ?? 0)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                    <CardDescription>
                        Chi tiết các dòng hàng có trong hóa đơn
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Table<OrderDetailRes>
                        rowKey="id"
                        columns={detailColumns}
                        dataSource={order.details ?? []}
                        pagination={false}
                        scroll={{ x: 1100 }}
                        locale={{ emptyText: "Không có sản phẩm trong hóa đơn" }}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}