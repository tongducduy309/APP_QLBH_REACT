import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Tag, Popconfirm, Button as AntdButton } from "antd";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteEmployeeLeave,
  getEmployeeById,
  markEmployeeLeave,
} from "@/services/employee-api";
import { EmployeeLeaveDialog } from "../components/employee-leave-dialog";
import type {
  EmployeeItem,
  EmployeeLeaveCreateReq,
  EmployeeLeaveItem,
} from "../types/employee.types";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { formatDateToDDMMYYYY } from "@/utils/date";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 border-b py-3 text-sm">
      <div className="font-medium text-slate-500">{label}</div>
      <div>{value ?? "-"}</div>
    </div>
  );
}



export function EmployeeDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  

  const canManageLeave = useMemo(() => {
    console.log(user);
    const roles = Array.isArray((user as any)?.roles)
      ? (user as any).roles
      : [(user as any)?.role].filter(Boolean);

    return roles.includes("ADMIN") || roles.includes("STORE_MANAGER");
  }, [user]);

  const loadEmployee = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getEmployeeById(id);
      setEmployee(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const handleOpenLeaveDialog = () => {
    
    setLeaveDialogOpen(true);
  };

  const handleSubmitLeave = async (data: EmployeeLeaveCreateReq) => {
    if (!id) return;

    // console.log(data);

    if (!data.leaveDate) {
      toast.info("Vui lòng chọn ngày nghỉ.");
      return;
    }

    try {
      setLeaveLoading(true);
      await markEmployeeLeave(id, data);
      toast.success("Đánh dấu ngày nghỉ thành công.");
      setLeaveDialogOpen(false);
      await loadEmployee();
    } catch (error) {
      console.error(error);
      toast.error("Không thể đánh dấu ngày nghỉ.");
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleDeleteLeave = async (leaveDate: string) => {
    if (!id) return;

    try {
      await deleteEmployeeLeave(id, leaveDate);
      toast.success("Xoá ngày nghỉ thành công.");
      await loadEmployee();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xoá ngày nghỉ.");
    }
  };

  const leaveColumns = [
    {
      title: "Ngày nghỉ",
      dataIndex: "leaveDate",
      key: "leaveDate",
      render: (value: string) =>formatDateToDDMMYYYY(value) || "-",
    },
    {
      title: "Loại nghỉ",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (value: EmployeeLeaveItem["leaveType"]) => (
        <Tag color={value === "FULL_DAY" ? "red" : "orange"}>
          {value === "FULL_DAY" ? "Cả ngày" : "Nửa ngày"}
        </Tag>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (value?: string) => value || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_: unknown, record: EmployeeLeaveItem) =>
        canManageLeave ? (
          <Popconfirm
            title="Xoá ngày nghỉ?"
            description="Bạn có chắc muốn xoá ngày nghỉ này không?"
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDeleteLeave(record.leaveDate)}
          >
            <AntdButton danger>
              Xoá
            </AntdButton>
          </Popconfirm>
        ) : null,
    },
  ];

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!employee) {
    return (
      <div className="space-y-6 p-6">
        {/* nút quay lại */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Button>
        </div>

        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <div className="text-lg font-semibold">
            Không tìm thấy nhân viên
          </div>

          <Button onClick={() => navigate("/employees")}>
            Quay về danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="space-y-6 p-6">
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{employee.fullName}</h1>
            <p className="text-sm text-slate-500">Mã nhân viên: {employee.code}</p>
          </div>

          {canManageLeave ? (
            <Button onClick={handleOpenLeaveDialog}>Đánh dấu nghỉ</Button>
          ) : null}
        </div>

        <div>
          <InfoRow label="Họ và tên" value={employee.fullName} />
          <InfoRow label="Số điện thoại" value={employee.phone || "-"} />
          <InfoRow label="Địa chỉ" value={employee.address || "-"} />
          <InfoRow label="Chức vụ" value={employee.position || "-"} />
          <InfoRow label="Ngày vào làm" value={employee.hireDate || "-"} />
          <InfoRow
            label="Lương cơ bản"
            value={
              typeof employee.baseSalary === "number"
                ? employee.baseSalary.toLocaleString("vi-VN")
                : "-"
            }
          />
          <InfoRow
            label="Trạng thái"
            value={
              employee.active ? (
                <Tag color="green">Đang làm việc</Tag>
              ) : (
                <Tag color="red">Ngưng làm việc</Tag>
              )
            }
          />
          <InfoRow
            label="Nghỉ hôm nay"
            value={
              employee.onLeaveToday ? (
                <Tag color="red">Đang nghỉ</Tag>
              ) : (
                <Tag color="green">Đi làm</Tag>
              )
            }
          />
          <InfoRow
            label="Ngày nghỉ tháng này"
            value={employee.leaveDaysThisMonth ?? 0}
          />
          <InfoRow label="Tài khoản" value={employee.user?.username || "-"} />
          <InfoRow label="Email" value={employee.user?.email || "-"} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Danh sách ngày nghỉ</h2>
          <p className="text-sm text-slate-500">
            Quản lý các ngày nghỉ của nhân viên
          </p>
        </div>

        <Table
          rowKey="id"
          columns={leaveColumns}
          dataSource={employee.leaves ?? []}
          pagination={false}
          locale={{ emptyText: "Chưa có ngày nghỉ" }}
        />
      </div>

      <EmployeeLeaveDialog
        open={leaveDialogOpen}
        
        loading={leaveLoading}
        onClose={() => setLeaveDialogOpen(false)}
        onSubmit={handleSubmitLeave}
      />
    </div>
  );
}