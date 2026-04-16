import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Descriptions, Empty, Modal, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    ArrowLeft,
    Pencil,
    ReceiptText,
    Trash2,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
    deleteProduct,
    getInventoryById,
    getProductImportHistory,
} from "@/services/product-api";
import type {
    ProductInventoryRes,
    ProductVariantInventoryRes,
} from "../types/inventory.types";
import { useInventoryPage } from "../hooks/useInventoryPage";
import { ProductDialog } from "../components/ProductDialog";
import { PurchaseReceiptRes } from "@/features/purchase-receipts/types/purchase-receipt.types";

export function ProductDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const inventory = useInventoryPage();

    const [product, setProduct] = useState<ProductInventoryRes | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [importHistoryData, setImportHistoryData] = useState<
        PurchaseReceiptRes[]
    >([]);
    const [importHistoryLoading, setImportHistoryLoading] = useState(false);

    const productId = Number(id);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const data = await getInventoryById(productId);
            setProduct(data);
        } catch (error) {
            console.error("Failed to fetch product detail:", error);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchImportHistory = async () => {
        try {
            setImportHistoryLoading(true);
            const data = await getProductImportHistory(productId);
            setImportHistoryData(data);
        } catch (error) {
            console.error("Failed to fetch product import history:", error);
            setImportHistoryData([]);
        } finally {
            setImportHistoryLoading(false);
        }
    };

    const fetchAllData = async () => {
        if (!productId) {
            setLoading(false);
            setProduct(null);
            setImportHistoryData([]);
            return;
        }

        await Promise.all([fetchProductDetail(), fetchImportHistory()]);
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const variantColumns: ColumnsType<ProductVariantInventoryRes> = useMemo(
        () => [
            {
                title: "Biến thể",
                dataIndex: "variantCode",
                key: "variantCode",
                render: (value: string) => value || "-",
            },
            {
                title: "SKU",
                dataIndex: "sku",
                key: "sku",
                render: (value: string) => value || "-",
            },
            {
                title: "Mã kho",
                dataIndex: "inventoryCode",
                key: "inventoryCode",
                render: (value: string) => value || "-",
            },
            {
                title: "Trọng lượng",
                dataIndex: "weight",
                key: "weight",
                render: (value: number) => (value ? `${value}` : "-"),
            },
            {
                title: "Giá bán lẻ",
                dataIndex: "retailPrice",
                key: "retailPrice",
                render: (value: number) => formatCurrency(Number(value ?? 0)),
            },
            {
                title: "Giá bán sỉ",
                dataIndex: "storePrice",
                key: "storePrice",
                render: (value: number) => formatCurrency(Number(value ?? 0)),
            },
            {
                title: "Giá vốn",
                dataIndex: "costPrice",
                key: "costPrice",
                render: (value: number) => formatCurrency(Number(value ?? 0)),
            },
            {
                title: "Tồn kho",
                dataIndex: "remainingQty",
                key: "remainingQty",
                render: (value: number) => Number(value ?? 0),
            },
            {
                title: "Trạng thái",
                key: "active",
                render: (_, record) => (
                    <div className="flex flex-col gap-1">
                        <Tag color={record.active ? "green" : "red"}>
                            {record.active ? "Đang bán" : "Ngừng bán"}
                        </Tag>
                        <Tag color={record.outOfStock ? "red" : "blue"}>
                            {record.outOfStock ? "Hết hàng" : "Còn tồn"}
                        </Tag>
                    </div>
                ),
            },
        ],
        []
    );

    const importHistoryColumns: ColumnsType<PurchaseReceiptRes> = useMemo(
        () => [
            {
                title: "Thời gian",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 170,
                render: (value?: string) => value,
            },
            {
                title: "Tên sản phẩm",
                dataIndex: "name",
                key: "name",
                width: 220,
                render: (value?: string) => value || "-",
            },
            {
                title: "Biến thể",
                dataIndex: "productVariantCode",
                key: "productVariantCode",
                width: 180,
                render: (value?: string) => value || "-",
            },
            {
                title: "SKU",
                dataIndex: "productVariantSKU",
                key: "productVariantSKU",
                width: 160,
                render: (value?: string) => value || "-",
            },
            {
                title: "Phương thức nhập",
                dataIndex: "purchaseReceiptMethod",
                key: "purchaseReceiptMethod",
                width: 180,
                render: (value?: string) => {
                    if (!value) return "-";

                    switch (value) {
                        case "ADDITIVE":
                            return <Tag color="blue">Cộng dồn tồn kho</Tag>;
                        case "SEPARATE":
                            return <Tag color="purple">Tạo tồn kho riêng</Tag>;
                        default:
                            return <Tag>{value}</Tag>;
                    }
                },
            },
            {
                title: "Số lượng",
                dataIndex: "totalQuantity",
                key: "totalQuantity",
                width: 100,
                align: "right",
                render: (value?: number) => Number(value ?? 0),
            },
            {
                title: "Giá vốn",
                dataIndex: "cost",
                key: "cost",
                width: 140,
                align: "right",
                render: (value?: number) => formatCurrency(Number(value ?? 0)),
            },
            {
                title: "Nhà cung cấp",
                dataIndex: "supplier",
                key: "supplier",
                width: 180,
                render: (value?: string) => value || "-",
            },
            {
                title: "Ghi chú",
                dataIndex: "note",
                key: "note",
                width: 220,
                render: (value?: string) => value || "-",
            },
        ],
        []
    );

    const handleQuickEditProduct = () => {
        if (!product) return;
        inventory.openEditDialog(product);
    };

    const handleOpenDeleteDialog = () => {
        if (!product) return;
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        if (deleting) return;
        setDeleteModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!productId || deleting) return;

        try {
            setDeleting(true);
            await deleteProduct(productId);
            setDeleteModalOpen(false);
            navigate("/products");
        } catch (error) {
            console.error("Failed to delete product:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleCloseProductDialog = () => {
        inventory.setIsProductDialogOpen(false);
        inventory.resetForm();
    };

    const handleSubmitProductDialog = async () => {
        await inventory.handleSubmit();
        await fetchAllData();
    };

    if (loading) {
        return (
            <PageShell>
                <div className="flex min-h-[320px] items-center justify-center">
                    <Spin size="large" />
                </div>
            </PageShell>
        );
    }

    if (!product) {
        return (
            <PageShell>
                <div className="space-y-4">
                    <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>

                    <Card>
                        <CardContent className="py-12">
                            <Empty description="Không tìm thấy sản phẩm" />
                        </CardContent>
                    </Card>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Chi tiết sản phẩm</div>
                        <h1 className="text-2xl font-semibold">{product.name}</h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <Tag color={product.active ? "green" : "red"}>
                                {product.active ? "Đang bán" : "Ngừng bán"}
                            </Tag>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            icon={<Pencil size={16} />}
                            onClick={handleQuickEditProduct}
                        >
                            Sửa nhanh sản phẩm
                        </Button>

                        <Button
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={handleOpenDeleteDialog}
                        >
                            Xóa sản phẩm
                        </Button>

                        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    </div>
                </div>

                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">
                            Thông tin chung
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Descriptions
                            bordered
                            column={2}
                            size="middle"
                            className="
                                [&_.ant-descriptions-item-label]:w-[180px]
                                [&_.ant-descriptions-item-label]:bg-muted/40
                                [&_.ant-descriptions-item-label]:font-medium
                                [&_.ant-descriptions-item-content]:bg-background
                            "
                        >
                            <Descriptions.Item label="Tên sản phẩm">
                                <span className="font-medium">{product.name || "-"}</span>
                            </Descriptions.Item>

                            <Descriptions.Item label="Danh mục">
                                <span className="font-medium">
                                    {product.categoryName || "-"}
                                </span>
                            </Descriptions.Item>

                            <Descriptions.Item label="Đơn vị cơ bản">
                                <span className="font-medium">{product.baseUnit || "-"}</span>
                            </Descriptions.Item>

                            <Descriptions.Item label="Kinh doanh">
                                <Tag color={product.active ? "green" : "red"}>
                                    {product.active ? "Đang bán" : "Ngừng bán"}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Mô tả" span={2}>
                                <div className="whitespace-pre-line break-words text-sm leading-6">
                                    {product.description || "-"}
                                </div>
                            </Descriptions.Item>
                        </Descriptions>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách biến thể</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table<ProductVariantInventoryRes>
                            rowKey={(record, index) =>
                                String(record.variantId ?? `${record.sku}-${index}`)
                            }
                            columns={variantColumns}
                            dataSource={product.variants ?? []}
                            pagination={false}
                            scroll={{ x: 1200 }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ReceiptText className="h-5 w-5" />
                            Lịch sử nhập kho theo biến thể
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table<PurchaseReceiptRes>
                            rowKey={(record) => String(record.id)}
                            columns={importHistoryColumns}
                            dataSource={importHistoryData}
                            loading={importHistoryLoading}
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 1200 }}
                            locale={{
                                emptyText: "Chưa có lịch sử nhập kho.",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ProductDialog
                open={inventory.isProductDialogOpen}
                isEditing={inventory.isEditingProduct}
                value={inventory.form}
                onClose={handleCloseProductDialog}
                onChange={inventory.setForm}
                onAddVariant={inventory.addVariant}
                onRemoveVariant={inventory.removeVariant}
                onUpdateVariant={inventory.updateVariant}
                onSubmit={handleSubmitProductDialog}
            />

            <Modal
                title="Xác nhận xóa sản phẩm"
                open={deleteModalOpen}
                onCancel={handleCloseDeleteDialog}
                onOk={handleConfirmDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{
                    danger: true,
                    loading: deleting,
                }}
                cancelButtonProps={{
                    disabled: deleting,
                }}
                centered
            >
                <div className="space-y-2">
                    <p>
                        Bạn có chắc chắn muốn xóa sản phẩm{" "}
                        <span className="font-semibold">{product.name}</span> không?
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Hành động này không thể hoàn tác.
                    </p>
                </div>
            </Modal>
        </PageShell>
    );
}