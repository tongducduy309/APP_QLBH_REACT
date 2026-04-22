import { useEffect, useMemo, useState } from "react";
import { Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { removeVietnameseTones } from "@/utils/string";

import { createEmployee, getEmployees } from "@/services/employee-api";
import type {
  EmployeeCreateReq,
  EmployeeItem,
} from "../types/employee.types";
import { EmployeeDialog } from "../components/employee-dialog";

const initialForm: EmployeeCreateReq = {
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

function getEmployeeDetailPath(id: number | string) {
  return paths.employeeDetail.replace(":id", String(id));
}

export function EmployeesPage() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<EmployeeCreateReq>(initialForm);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await getEmployees();
        setEmployees(res);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách nhân viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones(search.trim()),
    [search]
  );

  const filteredEmployees = useMemo(() => {
    if (!normalizedKeyword) return employees;

    return employees.filter((employee) => {
      const values = [
        employee.code,
        employee.fullName,
        employee.phone,
        employee.user.username,
        employee.user.email,
        employee.position,
        employee.address,
        employee.user?.roles?.join(" "),
      ];

      return values.some((item) =>
        removeVietnameseTones(item || "").includes(normalizedKeyword)
      );
    });
  }, [employees, normalizedKeyword]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm(initialForm);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error("Vui lòng nhập mã nhân viên.");
      return;
    }

    if (!form.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên.");
      return;
    }

    if (!form.username.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập.");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setDialogLoading(true);

      const created = await createEmployee({
        ...form,
        code: form.code.trim(),
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
        position: form.position?.trim(),
        email: form.email?.trim(),
      });

      setEmployees((prev) => [created, ...prev]);
      toast.success("Tạo nhân viên thành công.");
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo nhân viên.");
    } finally {
      setDialogLoading(false);
    }
  };

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
          onClick={() => navigate(getEmployeeDetailPath(record.id))}
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
            {record.user.email || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Tài khoản",
      key: "account",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user.username || "-"}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {record.user?.roles?.length ? (
              record.user?.roles.map((role) => <Tag key={role}>{role}</Tag>)
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Lương tháng",
      dataIndex: "baseSalary",
      key: "baseSalary",
      align: "right",
      render: (value: number) => formatCurrency(value || 0),
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
          onClick={() => navigate(getEmployeeDetailPath(record.id))}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý nhân viên</CardTitle>
          <CardDescription>
            Danh sách nhân viên và tài khoản đăng nhập tương ứng
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              prefix={<Search size={16} />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã, tên, tài khoản, vai trò..."
              className="md:w-[340px]"
            />

            <Button onClick={() => setDialogOpen(true)}>Thêm nhân viên</Button>
          </div>

          <Table<EmployeeItem>
            rowKey="id"
            columns={columns}
            dataSource={filteredEmployees}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
            locale={{
              emptyText: search
                ? "Không tìm thấy nhân viên phù hợp."
                : "Chưa có nhân viên",
            }}
          />
        </CardContent>
      </Card>

      <EmployeeDialog
        open={dialogOpen}
        value={form}
        loading={dialogLoading}
        onClose={handleCloseDialog}
        onChange={setForm}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}