import { DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import type { EmployeeCreateReq } from "../types/employee.types";
import { Role } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getNextEmployeeCode } from "@/services/employee-api";
import ValidatedInput, {
  type ValidatedInputStatus,
} from "@/components/ui/validated-input";
import { checkUsernameNotExists } from "@/services/auth-api";
import type { EmployeeUpdateReq } from "../types/employee.types";

type Props = {
  open: boolean;
  value: EmployeeCreateReq | EmployeeUpdateReq;
  loading?: boolean;
  onClose: () => void;
  onChange: (next: EmployeeCreateReq | EmployeeUpdateReq) => void;
  onSubmit: () => void;
  isEditing?: boolean;
};

const roleOptions: { label: string; value: Role }[] = [
  { label: "Quản trị viên", value: "ADMIN" },
  { label: "Quản lý cửa hàng", value: "STORE_MANAGER" },
  { label: "Nhân viên văn phòng", value: "OFFICE_STAFF" },
  { label: "Chạy máy kiêm giao hàng", value: "OPERATOR_DELIVERY" },
];

export function EmployeeDialog({
  open,
  value,
  loading,
  onClose,
  onChange,
  onSubmit,
  isEditing,
}: Props) {
  const [usernameStatus, setUsernameStatus] =
    useState<ValidatedInputStatus>("neutral");

  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (open && !isEditing) {
      getNextEmployeeCode().then((code) => {
        onChange({ ...value, code });
      });
    }
  }, [open]);

  useEffect(() => {
    const username = value.username?.trim() ?? "";

    if (!username) {
      setUsernameStatus("neutral");
      setCheckingUsername(false);
      return;
    }

    setUsernameStatus("neutral");
    setCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        if (username.length < 5) {
          setUsernameStatus("invalid");
          return;
        }
        const notExists = await checkUsernameNotExists(username);
        // const exists = false;

        setUsernameStatus(notExists ? "valid" : "invalid");
      } catch (error) {
        console.error(error);
        setUsernameStatus("invalid");
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      setCheckingUsername(false);
    };
  }, [value.username]);

  return (
    <Modal
      open={open}
      title={isEditing ? "Cập nhật nhân viên" : "Tạo nhân viên"}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Đóng"
      width={760}
      destroyOnHidden
    >
      <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employee-code">Mã nhân viên</Label>
          <Input
            id="employee-code"
            placeholder="Nhập mã nhân viên"
            value={value.code}
            onChange={(e) => onChange({ ...value, code: e.target.value })}
            disabled={true}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-fullname">Họ và tên</Label>
          <Input
            id="employee-fullname"
            placeholder="Nhập họ và tên"
            value={value.fullName}
            onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-phone">Số điện thoại</Label>
          <Input
            id="employee-phone"
            placeholder="Nhập số điện thoại"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-position">Chức vụ</Label>
          <Input
            id="employee-position"
            placeholder="Nhập chức vụ"
            value={value.position}
            onChange={(e) => onChange({ ...value, position: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-address">Địa chỉ</Label>
          <Input
            id="employee-address"
            placeholder="Nhập địa chỉ"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Ngày vào làm</Label>
          <DatePicker
            className="h-10 w-full"
            placeholder="Chọn ngày vào làm"
            value={value.hireDate ? dayjs(value.hireDate) : null}
            format="DD/MM/YYYY"
            onChange={(date) =>
              onChange({
                ...value,
                hireDate: date ? date.format("YYYY-MM-DD") : "",
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-salary">Lương tháng</Label>
          <NumberInput
            id="employee-salary"
            placeholder="Nhập lương tháng"
            value={Number(value.baseSalary ?? 0)}
            onValueChange={(nextValue) =>
              onChange({
                ...value,
                baseSalary: Number.isFinite(nextValue) ? nextValue : 0,
              })
            }
            min={0}
            integerOnly
            textAlign="right"
            addonAfter="VND"
          />
        </div>

        <div className="space-y-2">
          <Label>Phân quyền</Label>
          <Select
            value={value.role}
            onValueChange={(role: Role) =>
              onChange({ ...value, role: role as Role })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phân quyền" />
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              <SelectGroup>
                <SelectLabel>Phân quyền</SelectLabel>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-username">Tên đăng nhập</Label>
          <ValidatedInput
            id="employee-username"
            placeholder="Nhập tên đăng nhập"
            value={value.username}
            validateStatus={isEditing ? "neutral" : usernameStatus}
            loading={checkingUsername}
            errorMessage="Tên đăng nhập phải có ít nhất 5 ký tự hoặc đã tồn tại"
            onChange={(e) => onChange({ ...value, username: e.target.value })}
            disabled={isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-email">Email</Label>
          <Input
            id="employee-email"
            placeholder="Nhập email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}