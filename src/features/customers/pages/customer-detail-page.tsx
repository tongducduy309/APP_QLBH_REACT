import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/page-shell";
import { Button as AntdButton } from "antd";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCustomerById } from "@/services/customer-api";
import type { CustomerDetailRes } from "../types/customer.types";
import { formatCurrency } from "@/lib/utils";
import { formatDateTime } from "@/utils/date";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerDetailRes | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await getCustomerById(Number(id));
        setCustomer(res);
      } catch (error) {
        console.error("Lỗi lấy chi tiết khách hàng", error);
        // toast.error("Không thể tải chi tiết khách hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (!id) {
    return (
      <PageShell>
        <Card className="border-0 shadow-sm">
          <CardContent className="py-10 text-center text-muted-foreground">
            Không tìm thấy mã khách hàng.
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <AntdButton
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách khách hàng
              </AntdButton>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              {loading ? "Đang tải..." : customer?.name || "Chi tiết khách hàng"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi thông tin liên hệ và công nợ của khách hàng
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-0 shadow-sm xl:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Thông tin khách hàng
              </CardTitle>
              <CardDescription>
                Thông tin cơ bản và liên hệ
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem
                  icon={<User2 className="h-4 w-4" />}
                  label="Tên khách hàng"
                  value={customer?.name || "-"}
                />

                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Số điện thoại"
                  value={customer?.phone || "-"}
                />

                <InfoItem
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={customer?.email || "-"}
                />

                <InfoItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Mã số thuế"
                  value={customer?.taxCode || "-"}
                />

                <div className="md:col-span-2">
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Địa chỉ"
                    value={customer?.address || "-"}
                  />
                </div>

                <InfoItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Ngày tạo"
                  value={customer?.createdAt ? formatDateTime(customer.createdAt) : "-"}
                />

                <InfoItem
                  icon={<Wallet className="h-4 w-4" />}
                  label="Tổng công nợ"
                  value={formatCurrency(customer?.totalDebt ?? 0)}
                  valueClassName={
                    (customer?.totalDebt ?? 0) > 0
                      ? "text-red-600 font-semibold"
                      : "text-emerald-600 font-semibold"
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Tổng quan
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <SummaryBox
                  label="Mã khách hàng"
                  value={customer?.id ? `#${customer.id}` : "-"}
                />
                <SummaryBox
                  label="Tổng công nợ"
                  value={formatCurrency(customer?.totalDebt ?? 0)}
                  highlight={(customer?.totalDebt ?? 0) > 0}
                />
                <SummaryBox
                  label="Trạng thái"
                  value={(customer?.totalDebt ?? 0) > 0 ? "Còn nợ" : "Đã thanh toán đủ"}
                  success={(customer?.totalDebt ?? 0) <= 0}
                />
              </CardContent>
            </Card>

            {/* <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Ghi chú
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <ReceiptText className="h-4 w-4" />
                    Thông tin từ hệ thống
                  </div>
                  API backend hiện trả về chi tiết khách hàng gồm thông tin liên hệ,
                  ngày tạo và tổng công nợ. Nếu bạn muốn mình làm tiếp phần lịch sử
                  đơn hàng của riêng khách này ở ngay trang này, mình có thể nối thêm.
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
};

function InfoItem({ icon, label, value, valueClassName }: InfoItemProps) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={valueClassName || "font-medium break-words"}>{value}</p>
    </div>
  );
}

type SummaryBoxProps = {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
};

function SummaryBox({ label, value, highlight, success }: SummaryBoxProps) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={[
          "mt-1 text-lg font-semibold",
          highlight ? "text-red-600" : "",
          success ? "text-emerald-600" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}