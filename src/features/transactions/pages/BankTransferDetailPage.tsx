import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Descriptions, Empty, Spin, Tag } from "antd";
import { ArrowLeft } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { SepayTransaction } from "@/features/transactions/types/sepay.types";
import { getSepayTransactionDetails } from "@/services/sepay-api";
import { formatDateTimeDDMMYYYY_HHMMSS } from "@/utils/date";
import { useAppSettingsStore } from "@/features/settings/store/app-settings-store";

export function BankTransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<SepayTransaction | null>(null);
  const [loading, setLoading] = useState(false);

  const appSettingsStore = useAppSettingsStore();

  const fetchTransaction = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await getSepayTransactionDetails(id);
      setTransaction(res);
    } catch (error) {
      console.error("Lỗi lấy chi tiết chuyển tiền", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appSettingsStore.loading) return;

    // If fh is enabled in app settings, do not fetch and allow NotFound to render
    if (appSettingsStore.appSettings.fh) {
      return;
    }

    fetchTransaction();
  }, [id, appSettingsStore.loading, appSettingsStore.appSettings.fh]);

  if (appSettingsStore.loading) {
    return (
      <PageShell>
        <div className="flex min-h-[300px] items-center justify-center">
          <Spin size="large" />
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[300px] items-center justify-center">
          <Spin size="large" />
        </div>
      </PageShell>
    );
  }

  if (!transaction) {
    return (
      <PageShell>
        <Card>
          <CardContent className="py-10">
            <Empty description="Không tìm thấy giao dịch" />
            <div className="mt-4 flex justify-center">
              <Button onClick={() => navigate("/transactions")}>Quay lại lịch sử giao dịch</Button>
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
            <h1 className="text-xl font-semibold">Chi tiết chuyển tiền</h1>
            <p className="text-sm text-muted-foreground">Xem thông tin chi tiết giao dịch chuyển tiền từ Sepay.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin giao dịch</CardTitle>
            <CardDescription>Chi tiết các trường dữ liệu của giao dịch chuyển tiền.</CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="Mã giao dịch">{transaction.id}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">{formatDateTimeDDMMYYYY_HHMMSS(transaction.transaction_date) || "-"}</Descriptions.Item>
              <Descriptions.Item label="Ngân hàng">{transaction.bank_brand_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Số tài khoản">{transaction.account_number || "-"}</Descriptions.Item>
              <Descriptions.Item label="Loại chuyển tiền">
                {transaction.transfer_type === "in" ? (
                  <Tag color="green">Tiền vào</Tag>
                ) : (
                  <Tag color="red">Tiền ra</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mã tham chiếu">{transaction.reference_number || "-"}</Descriptions.Item>
              <Descriptions.Item label="Nội dung">{transaction.transaction_content || "-"}</Descriptions.Item>
              <Descriptions.Item label="Mã VA">{transaction.va || "-"}</Descriptions.Item>
              <Descriptions.Item label="Mã VA ID">{transaction.va_id ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Ngân hàng nhận">{transaction.bank_account_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Mã ngân hàng">{transaction.code || "-"}</Descriptions.Item>
              <Descriptions.Item label="Webhook">
                {transaction.webhook_success === 1 ? (
                  <Tag color="green">Thành công</Tag>
                ) : (
                  <Tag color="orange">Chưa xử lý</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin tiền</CardTitle>
            <CardDescription>Tổng hợp số tiền vào/ra.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Số tiền vào</span>
                  <span className="font-semibold text-green-600">{formatCurrency(transaction.amount_in)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-muted-foreground">
                  <span>Số tiền ra</span>
                  <span className="font-semibold text-red-600">{formatCurrency(transaction.amount_out)}</span>
                </div>
              </div>

              {/* <div className="rounded-xl border p-4 bg-slate-50">
                <div className="flex items-center justify-between font-medium">
                  <span>Số dư tích lũy</span>
                  <span>{formatCurrency(transaction.accumulated)}</span>
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}