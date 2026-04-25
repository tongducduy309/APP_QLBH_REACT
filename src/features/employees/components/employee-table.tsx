import { Input, Popconfirm, Table, Tag } from "antd";
import { Button } from "@/components/ui/button";
import type { EmployeeItem } from "../types/employee.types";
import { formatCurrency } from "@/lib/utils";
import { ColumnsType } from "antd/es/table";
import { RestrictedIcon } from "@/components/common/restricted-icon";

type Props = {
  items: EmployeeItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onViewDetail: (employee: EmployeeItem) => void;
  canViewSalary: boolean;
  canAddEmployee: boolean;
};

export function EmployeeTable({
  items,
  searchValue,
  onSearchChange,
  page,
  pageSize,
  total,
  onPageChange,
  onCreate,
  onViewDetail,
  canViewSalary,
  canAddEmployee,
}: Props) {
  const columns: ColumnsType<EmployeeItem> = [
      {
        title: "Mã NV",
        dataIndex: "code",
        key: "code",
        width: 120,
      },
      {
        title: "Họ tên",
        key: "fullName",
        render: (_, record) => (
          <button
            type="button"
            onClick={() => onViewDetail(record)}
            className="text-left"
          >
            <div className="font-medium text-slate-900 hover:text-primary">
              {record.fullName}
            </div>
            <div className="text-xs text-muted-foreground">
              {record.position || "-"}
            </div>
          </button>
        ),
      },
      {
        title: "Liên hệ",
        key: "contact",
        render: (_, record) => (
          <div>
            <div>{record.phone || "-"}</div>
            <div className="text-xs text-muted-foreground">
              {record?.user?.email || "-"}
            </div>
          </div>
        ),
      },
      // {
      //   title: "Tài khoản",
      //   key: "account",
      //   render: (_, record) => (
      //     <div>
      //       <div className="font-medium">{record?.user?.username || "-"}</div>
      //       <div className="mt-1 flex flex-wrap gap-1">
      //         {record.user?.roles?.length ? (
      //           record.user?.roles.map((role) => <Tag key={role}>{role}</Tag>)
      //         ) : (
      //           <span className="text-muted-foreground">-</span>
      //         )}
      //       </div>
      //     </div>
      //   ),
      // },
      {
        title: "Lương tháng",
        dataIndex: "baseSalary",
        key: "baseSalary",
        align: canViewSalary?"right":"center",
        render: (value: number) => canViewSalary?formatCurrency(value || 0):(<RestrictedIcon/>),
      },
      {
    title: "Nghỉ hôm nay",
    dataIndex: "onLeaveToday",
    key: "onLeaveToday",
    width: 130,
    render: (value?: boolean) =>
      value ? <Tag color="red">Nghỉ</Tag> : <Tag color="green">Đi làm</Tag>,
  },
  {
    title: "Nghỉ tháng này",
    dataIndex: "leaveDaysThisMonth",
    key: "leaveDaysThisMonth",
    width: 140,
    render: (value?: number) => value ?? 0,
  },
      {
        title: "Trạng thái",
        dataIndex: "active",
        key: "active",
        width: 120,
        render: (active: boolean) => (
          <Tag color={active ? "green" : "default"}>
            {active ? "Đang làm" : "Ngưng làm"}
          </Tag>
        ),
      },
      {
        title: "",
        key: "action",
        width: 120,
        render: (_, record) => (
          <Button
            variant="outline"
            onClick={() => onViewDetail(record)}
          >
            Chi tiết
          </Button>
        ),
      },
    ];

  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Tìm theo mã, tên, số điện thoại, tài khoản..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="max-w-md"
        />

        {canAddEmployee && (
          <Button onClick={onCreate}>Thêm nhân viên</Button>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        locale={{ emptyText: "Không có nhân viên" }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}


