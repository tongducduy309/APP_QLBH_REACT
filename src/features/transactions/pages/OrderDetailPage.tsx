import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Descriptions, Empty, Spin, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeft, Eye, FileDown, Pencil, Printer, Trash2 } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
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
import { OrderStatus, type OrderDetailRes, type OrderRes } from "@/types/order";
import { cancelOrder, getOrderById } from "@/services/order-api";
import {
    downloadInvoice,
    previewInvoice,
    printInvoice,
} from "@/features/print/services/Invoice-pdf-print.service";
import { Button as ShadcnButton } from "@/components/ui/button";

export function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderRes | null>(null);
    const [loading, setLoading] = useState(false);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelConfirmed, setCancelConfirmed] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const fetchOrder = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const res = await getOrderById(Number(id));
            setOrder(res);
        } catch (error) {
            console.error("Lỗi lấy chi tiết hóa đơn", error);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const openCancelDialog = () => {
        setCancelConfirmed(false);
        setCancelDialogOpen(true);
    };

    const handleConfirmCancelOrder = async () => {
        if (!order?.id || !cancelConfirmed) return;

        try {
            setCancelLoading(true);

            await cancelOrder(order.id);

            message.success("Đã hủy hóa đơn");

            setCancelDialogOpen(false);
            setCancelConfirmed(false);

            await fetchOrder();
            navigate("/transactions");
        } catch (error) {
            console.error("Lỗi hủy hóa đơn", error);
            message.error("Hủy hóa đơn thất bại");
        } finally {
            setCancelLoading(false);
        }
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
                    <Button
                        icon={<ArrowLeft className="h-4 w-4" />}
                        onClick={() => navigate(-1)}
                    >
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
                    <Button
                        icon={<FileDown className="h-4 w-4" />}
                        onClick={handleDownloadOrder}
                    >
                        Tải hóa đơn
                    </Button>

                    <Button
                        icon={<Pencil size={16} />}
                        onClick={() => navigate(`/transactions/edit/${order.id}`)}
                    >
                        Chỉnh sửa
                    </Button>

                    <Button
                        icon={<Eye className="h-4 w-4" />}
                        onClick={handleViewOrder}
                    >
                        Xem hóa đơn
                    </Button>

                    <Button
                        icon={<Printer className="h-4 w-4" />}
                        onClick={handlePrintOrder}
                    >
                        In hóa đơn
                    </Button>

                    <Button
                        danger
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={openCancelDialog}
                    >
                        Hủy hóa đơn
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
                                {order.createdAt || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Khách hàng">
                                {
                                    order.customer?.id ? (
                                        <Link className="font-semibold hover:underline" to={`/customers/${order.customer?.id}`}>
                                            {order.customer?.name || "Khách lẻ"}
                                        </Link>
                                    ) : (
                                        order.customer?.name || "Khách lẻ"
                                    )
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="Tài khoản">
                                <Tag color={order.customer?.id ? "blue" : "orange"}>
                                    {order.customer?.id ? "Thành viên" : "Chưa xác định"}
                                </Tag>
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
                            <Descriptions.Item label="Trạng thái hóa đơn">
                                {order.status === OrderStatus.CONFIRMED ? (
                                    <Tag color="green">Chính thức</Tag>
                                ) : (
                                    <Tag color="red">Bản nháp</Tag>
                                )}
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

            <Dialog
                open={cancelDialogOpen}
                onOpenChange={(open) => {
                    setCancelDialogOpen(open);
                    if (!open) {
                        setCancelConfirmed(false);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Xác nhận hủy hóa đơn</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Bạn có chắc chắn muốn hủy hóa đơn{" "}
                            <span className="font-medium text-foreground">{order.code}</span>
                            ? Nếu đồng ý, vui lòng tick vào ô xác nhận bên dưới.
                        </p>

                        <div className="flex items-start gap-3 rounded-md border p-3">
                            <Checkbox
                                id="confirm-cancel-order"
                                checked={cancelConfirmed}
                                onCheckedChange={(checked) =>
                                    setCancelConfirmed(checked === true)
                                }
                            />
                            <label
                                htmlFor="confirm-cancel-order"
                                className="text-sm leading-5"
                            >
                                Tôi xác nhận muốn hủy hóa đơn này
                            </label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <ShadcnButton
                                variant="outline"
                                onClick={() => {
                                    setCancelDialogOpen(false);
                                    setCancelConfirmed(false);
                                }}
                                disabled={cancelLoading}
                            >
                                Quay lại
                            </ShadcnButton>

                            <ShadcnButton
                                variant="destructive"
                                onClick={handleConfirmCancelOrder}
                                disabled={!cancelConfirmed || cancelLoading}
                            >
                                {cancelLoading ? "Đang hủy..." : "Xác nhận hủy"}
                            </ShadcnButton>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageShell>
    );
}