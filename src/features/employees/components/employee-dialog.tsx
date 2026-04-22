import { DatePicker, Input, InputNumber, Modal, Select } from "antd";
import dayjs from "dayjs";
import type {
  EmployeeCreateReq,
} from "../types/employee.types";
import { Role } from "@/types/user";

type Props = {
  open: boolean;
  value: EmployeeCreateReq;
  loading?: boolean;
  onClose: () => void;
  onChange: (next: EmployeeCreateReq) => void;
  onSubmit: () => void;
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
}: Props) {
  return (
    <Modal
      open={open}
      title="Tạo nhân viên"
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Đóng"
      width={760}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          placeholder="Mã nhân viên"
          value={value.code}
          onChange={(e) => onChange({ ...value, code: e.target.value })}
        />

        <Input
          placeholder="Họ và tên"
          value={value.fullName}
          onChange={(e) => onChange({ ...value, fullName: e.target.value })}
        />

        <Input
          placeholder="Số điện thoại"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />

        <Input
          placeholder="Chức vụ"
          value={value.position}
          onChange={(e) => onChange({ ...value, position: e.target.value })}
        />

        <Input
          placeholder="Địa chỉ"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />

        <DatePicker
          className="w-full"
          placeholder="Ngày vào làm"
          value={value.hireDate ? dayjs(value.hireDate) : null}
          onChange={(date) =>
            onChange({
              ...value,
              hireDate: date ? date.format("YYYY-MM-DD") : "",
            })
          }
        />

        <InputNumber
          className="w-full"
          min={0}
          placeholder="Lương tháng"
          value={value.baseSalary}
          onChange={(val) =>
            onChange({ ...value, baseSalary: Number(val ?? 0) })
          }
        />

        <Select
          placeholder="Phân quyền"
          options={roleOptions}
          value={value.role}
          onChange={(role) => onChange({ ...value, role })}
        />

        <Input
          placeholder="Tên đăng nhập"
          value={value.username}
          onChange={(e) => onChange({ ...value, username: e.target.value })}
        />

        <Input.Password
          placeholder="Mật khẩu"
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
        />

        <div className="md:col-span-2">
          <Input
            placeholder="Email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}