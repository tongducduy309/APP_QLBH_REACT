import { useEffect, useState } from "react";
import { Tag } from "antd";
import { ArrowLeft, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { paths } from "@/routes/paths";
import { formatCurrency } from "@/lib/utils";
import { getEmployeeById } from "@/services/employee-api";
import type { EmployeeItem } from "../types/employee.types";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b py-3 md:grid-cols-[180px_1fr] md:gap-4">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm text-slate-900">{value || "-"}</div>
    </div>
  );
}

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState<EmployeeItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeById(id);
        setEmployee(res);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải chi tiết nhân viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  return (
    <PageShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(paths.employees)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <UserRound className="h-10 w-10 text-slate-500" />
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold">
                {loading ? "Đang tải..." : employee?.fullName || "-"}
              </div>
              <div className="text-sm text-muted-foreground">
                {employee?.position || "Chưa cập nhật chức vụ"}
              </div>
            </div>

            <Tag color={employee?.active ? "green" : "default"}>
              {employee?.active ? "Đang làm" : "Ngưng làm"}
            </Tag>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chi tiết nhân viên</CardTitle>
            <CardDescription>
              Thông tin hồ sơ và tài khoản đăng nhập
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DetailRow label="Mã nhân viên" value={employee?.code} />
            <DetailRow label="Họ và tên" value={employee?.fullName} />
            <DetailRow label="Số điện thoại" value={employee?.phone} />
            <DetailRow label="Địa chỉ" value={employee?.address} />
            <DetailRow label="Chức vụ" value={employee?.position} />
            <DetailRow label="Ngày vào làm" value={employee?.hireDate} />
            <DetailRow
              label="Lương tháng"
              value={
                employee?.baseSalary != null
                  ? formatCurrency(employee.baseSalary)
                  : "-"
              }
            />
            <DetailRow label="Tên đăng nhập" value={employee?.user?.username} />
            <DetailRow label="Email" value={employee?.user?.email} />
            <DetailRow
              label="Vai trò"
              value={
                employee?.user?.roles?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {employee?.user?.roles.map((role) => (
                      <Tag key={role}>{role}</Tag>
                    ))}
                  </div>
                ) : (
                  "-"
                )
              }
            />
            <DetailRow label="Ngày tạo" value={employee?.createdAt} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}