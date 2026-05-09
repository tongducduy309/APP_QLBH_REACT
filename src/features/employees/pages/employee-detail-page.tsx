import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Tag, Popconfirm, Button as AntdButton } from "antd";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteEmployee,
  deleteEmployeeLeave,
  getEmployeeById,
  markEmployeeLeave,
  resetPassword,
  updateEmployee,
  updateEmployeeStatus,
} from "@/services/employee-api";
import { EmployeeLeaveDialog } from "../components/employee-leave-dialog";
import type {
  EmployeeCreateReq,
  EmployeeItem,
  EmployeeLeaveCreateReq,
  EmployeeLeaveItem,
  EmployeeUpdateReq,
} from "../types/employee.types";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { formatDateToDDMMYYYY } from "@/utils/date";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CircleDollarSign, CircleUserRound, EllipsisVertical, Eye, FileDown, KeyRound, Mail, Pencil, Printer, RotateCcw, Trash2, UserLock } from "lucide-react";
import { usePermission } from "@/app/hooks/usePermission";
import { RestrictedIcon } from "@/components/common/restricted-icon";
import { getPayroll, getPayrollById } from "@/services/payroll-api";
import { printPayrollPdf } from "@/features/payroll/utils/payroll-pdf";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConfirmPassword } from "@/app/providers/confirm-password-provider";
import { useConfirmAction } from "@/app/providers/confirm-action-provider";
import { EmployeeDialog } from "../components/employee-dialog";
import { buildEmployeeUpdateReq } from "../utils/employee.help";

const initialForm: EmployeeUpdateReq = {
  code: "",
  fullName: "",
  phone: "",
  address: "",
  position: "",
  hireDate: "",
  baseSalary: 0,
  username: "",
  password: "",
  email: "",
  role: "OFFICE_STAFF",
};

function InfoRow({
  label,
  value,
  visible = true,
}: {
  label: string;
  value: React.ReactNode;
  visible?: boolean;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 border-b py-3 text-sm">
      <div className="font-medium text-slate-500">{label}</div>
      <div>{visible ? value : <RestrictedIcon />}</div>
    </div>
  );
}



export function EmployeeDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [form, setForm] = useState<EmployeeCreateReq | EmployeeUpdateReq>(initialForm);


  const { hasRole } = usePermission();
  const { confirm } = useConfirmAction();
  const { confirmPassword } = useConfirmPassword();

  const canViewSalary = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canManageLeave = hasRole(["ADMIN", "STORE_MANAGER", "OFFICE_STAFF"]);
  const canViewUsername = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canViewAddress = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canPrintPayroll = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canManageEmployee = hasRole(["ADMIN", "STORE_MANAGER"]);





  const toggleEmployeeStatus = async () => {
    if (!id) return;

    const ok = await confirm({
      title: employee?.active ? "Tạm khóa tài khoản" : "Mở khóa tài khoản",
      description: employee?.active ? "Bạn có chắc chắn muốn tạm khóa tài khoản này không?" : "Bạn có chắc chắn muốn mở khóa tài khoản này không?",
      confirmText: employee?.active ? "Tạm khóa" : "Mở khóa",
      cancelText: "Không",
      variant: "destructive",
    });
    if (!ok) return;

    const password = await confirmPassword({
      title: employee?.active ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản",
      description: employee?.active ? "Nhập mật khẩu để xác nhận thao tác khóa tài khoản." : "Nhập mật khẩu để xác nhận thao tác mở khóa tài khoản.",

    });

    if (!password || !id) return;

    try {
      setLoading(true);

      const newStatus = !(employee?.active ?? true);

      await updateEmployeeStatus(Number(id), newStatus);

      toast.success(newStatus ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công");

      if (employee) {
        setEmployee((prev) => (prev ? { ...prev, active: newStatus } : null));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestPassword = async () => {
    if (!id) return;

    const password = await confirmPassword({
      title: "Xác nhận mật khẩu",
      description: "Nhập mật khẩu để xác nhận thao tác.",

    });

    if (!password || !id) return;

    try {
      setLoading(true);

      await resetPassword(Number(id));

      toast.success("Đặt lại mật khẩu thành công");

    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteEmployee = async () => {
    const ok = await confirm({
      title: "Xóa nhân viên",
      description: "Bạn có chắc chắn muốn xóa nhân viên này không?",
      confirmText: "Xóa",
      cancelText: "Không",
      variant: "destructive",
    });

    if (!ok) return;
    const password = await confirmPassword({
      title: "Xác nhận xóa nhân viên",
      description: "Nhập mật khẩu để xác nhận thao tác xóa nhân viên.",
      confirmText: "Xóa",
    });

    if (!password || !id) return;

    try {
      await deleteEmployee(id);
      toast.success("Xoá nhân viên thành công.");
      navigate("/employees");
    } catch (error) {
      console.error(error);
      // toast.error("Không thể xoá nhân viên.");
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    try {
      setLoading(true);

      if (employee?.id) {
        await updateEmployee(Number(employee.id), form);
        toast.success("Cập nhật thông tin nhân viên thành công.");
      }

      setIsEditDialogOpen(false);
      await loadEmployee();
    } catch (error) {
      console.error("Lỗi khi lưu thông tin nhân viên:", error);

    } finally {
      setLoading(false);
    }
  };



  // const canManageLeave = useMemo(() => {
  //   console.log(user);
  //   const roles = Array.isArray((user as any)?.roles)
  //     ? (user as any).roles
  //     : [(user as any)?.role].filter(Boolean);

  //   return roles.includes("ADMIN") || roles.includes("STORE_MANAGER");
  // }, [user]);

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

  const handlePrintPayroll = async () => {
    try {
      const now = new Date();

      const salaryDate = now.toISOString().slice(0, 10);

      const payrollData = await getPayrollById(salaryDate, Number(id));

      printPayrollPdf([payrollData]);
    } catch (error) {
      console.error(error);
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

    const ok = await confirm({
      title: "Xóa ngày nghỉ",
      description: "Bạn có chắc chắn muốn xóa ngày nghỉ này không?",
      confirmText: "Xóa",
      cancelText: "Không",
      variant: "destructive",
    });

    if (!ok) return;
    const password = await confirmPassword({
      title: "Xác nhận xóa ngày nghỉ",
      description: "Nhập mật khẩu để xác nhận thao tác xóa ngày nghỉ.",
      confirmText: "Xóa",
    });

    if (!password || !id) return;

    try {
      await deleteEmployeeLeave(id, leaveDate);
      toast.success("Xoá ngày nghỉ thành công.");
      await loadEmployee();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xoá ngày nghỉ.");
    }
  };

  const handleEdit = () => {
    if (!employee) return;
    setForm(buildEmployeeUpdateReq(employee))
    setIsEditDialogOpen(true);
  }

  const leaveColumns = [
    {
      title: "Ngày nghỉ",
      dataIndex: "leaveDate",
      key: "leaveDate",
      render: (value: string) => formatDateToDDMMYYYY(value) || "-",
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
        canManageEmployee ? (
          <AntdButton danger onClick={() => handleDeleteLeave(record.leaveDate)}>
            Xoá
          </AntdButton>
        ) : <RestrictedIcon message="Bạn không có quyền truy cập chức năng này. Vui lòng liên hệ quản lý." />,
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
          <div className="flex items-center gap-2">
            {canManageLeave ? (
              <Button onClick={handleOpenLeaveDialog}>Đánh dấu nghỉ</Button>
            ) : null}

            {
              (canManageEmployee || canPrintPayroll) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Thao tác nhân viên"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                      {canPrintPayroll && (
                        <DropdownMenuItem onClick={handlePrintPayroll}>
                          <Printer className="mr-2 h-4 w-4" />
                          In bảng lương
                        </DropdownMenuItem>
                      )}

                      {canManageEmployee && employee.active && (
                        <DropdownMenuItem onClick={toggleEmployeeStatus}>
                          <UserLock className="mr-2 h-4 w-4" />
                          Tạm khóa tài khoản
                        </DropdownMenuItem>
                      )}

                      {canManageEmployee && !employee.active && (
                        <DropdownMenuItem onClick={toggleEmployeeStatus}>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Mở khóa tài khoản
                        </DropdownMenuItem>
                      )}

                      {canManageEmployee && (
                        <DropdownMenuItem onClick={handleEdit}>
                          <CircleUserRound className="mr-2 h-4 w-4" />
                          Chỉnh sửa thông tin
                        </DropdownMenuItem>
                      )}

                      {canManageEmployee && (
                        <DropdownMenuItem onClick={handleRestPassword}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>
                      )}

                      {
                        canManageEmployee && (
                          <DropdownMenuSeparator />
                        )
                      }


                      {
                        canManageEmployee && (
                          <DropdownMenuItem
                            variant="destructive"

                            onClick={handleDeleteEmployee}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xoá nhân viên
                          </DropdownMenuItem>
                        )
                      }


                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>)
            }
          </div>

        </div>

        <div>
          <InfoRow label="Họ và tên" value={employee.fullName} />
          <InfoRow label="Số điện thoại" value={employee.phone || "-"} />
          <InfoRow label="Ngày sinh" value={formatDateToDDMMYYYY(employee.dateOfBirth) || "-"} />
          <InfoRow label="Địa chỉ" value={employee.address || "-"} visible={canViewAddress} />
          <InfoRow label="Chức vụ" value={employee.position || "-"} />
          <InfoRow label="Ngày vào làm" value={formatDateToDDMMYYYY(employee.hireDate) || "-"} />
          <InfoRow
            label="Lương cơ bản"
            value={
              typeof employee.baseSalary === "number"
                ? employee.baseSalary.toLocaleString("vi-VN")
                : "-"
            }
            visible={canViewSalary}
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
          <InfoRow label="Tài khoản" value={employee.user?.username || "-"} visible={canViewUsername} />
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

      <EmployeeDialog
        open={isEditDialogOpen}
        value={form}
        isEditing={true}
        loading={editLoading}
        onClose={() => setIsEditDialogOpen(false)}
        onChange={setForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}