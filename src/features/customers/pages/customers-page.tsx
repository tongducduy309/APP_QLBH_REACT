import { useEffect, useMemo, useState } from "react";
import { Input, Popconfirm, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "@/services/customer-api";
import type {
  CustomerCreateReq,
  CustomerRes,
} from "../types/customer.types";
import { CustomerDialog } from "../components/CustomerDialog";
import { removeVietnameseTones } from "@/utils/string";

const initialCreateForm: CustomerCreateReq = {
  name: "",
  phone: "",
  address: "",
  taxCode: "",
  email: "",
};

type CustomerTableRow =
  | {
      rowType: "group";
      key: string;
      groupLabel: string;
    }
  | {
      rowType: "customer";
      key: number;
      customer: CustomerRes;
    };

function getGroupKey(name?: string) {
  const normalized = removeVietnameseTones(name || "").trim();
  if (!normalized) return "#";
  const firstChar = normalized.charAt(0).toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : "#";
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [form, setForm] = useState<CustomerCreateReq>(initialCreateForm);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRes | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await getCustomers();
        setCustomers(res);
      } catch (error) {
        console.error("Lỗi lấy khách hàng", error);
        toast.error("Không thể tải danh sách khách hàng."+error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleOpenCreateDialog = () => {
    setEditingCustomer(null);
    setForm(initialCreateForm);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (customer: CustomerRes) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      taxCode: customer.taxCode ?? "",
      email: customer.email ?? "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
    setForm(initialCreateForm);
  };

  const handleSubmitCustomer = async () => {
    try {
      setDialogLoading(true);

      const payload: CustomerCreateReq = {
        name: form.name?.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
        taxCode: form.taxCode?.trim(),
        email: form.email?.trim(),
      };

      if (editingCustomer?.id) {
        const updatedCustomer = await updateCustomer(editingCustomer.id, payload);

        setCustomers((prev) =>
          prev.map((item) =>
            item.id === editingCustomer.id ? updatedCustomer : item
          )
        );

        toast.success("Cập nhật khách hàng thành công.");
      } else {
        const newCustomer = await createCustomer(payload);
        setCustomers((prev) => [newCustomer, ...prev]);
        toast.success("Thêm khách hàng thành công.");
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Lỗi lưu khách hàng", error);
      toast.error(
        editingCustomer
          ? "Không thể cập nhật khách hàng."
          : "Không thể thêm khách hàng."
      );
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteCustomer = async (id?: number) => {
    if (!id) {
      toast.error("Không tìm thấy khách hàng để xóa.");
      return;
    }

    try {
      setDeletingId(id);
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((item) => item.id !== id));
      toast.success("Xóa khách hàng thành công.");
    } catch (error) {
      console.error("Lỗi xóa khách hàng", error);
      toast.error("Không thể xóa khách hàng.");
    } finally {
      setDeletingId(null);
    }
  };

  const normalizedKeyword = useMemo(
    () => removeVietnameseTones(search),
    [search]
  );

  const filteredCustomers = useMemo(() => {
    if (!normalizedKeyword) return customers;

    return customers.filter((customer) => {
      const name = removeVietnameseTones(customer.name || "");
      const phone = removeVietnameseTones(customer.phone || "");
      const email = removeVietnameseTones(customer.email || "");
      const address = removeVietnameseTones(customer.address || "");
      const taxCode = removeVietnameseTones(customer.taxCode || "");

      return (
        name.includes(normalizedKeyword) ||
        phone.includes(normalizedKeyword) ||
        email.includes(normalizedKeyword) ||
        address.includes(normalizedKeyword) ||
        taxCode.includes(normalizedKeyword)
      );
    });
  }, [customers, normalizedKeyword]);

  const tableData = useMemo<CustomerTableRow[]>(() => {
    const sortedCustomers = [...filteredCustomers].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", "vi")
    );

    const result: CustomerTableRow[] = [];
    let currentGroup = "";

    for (const customer of sortedCustomers) {
      const groupKey = getGroupKey(customer.name);

      if (groupKey !== currentGroup) {
        currentGroup = groupKey;
        result.push({
          rowType: "group",
          key: `group-${groupKey}`,
          groupLabel: groupKey,
        });
      }

      result.push({
        rowType: "customer",
        key: customer.id ?? 0,
        customer,
      });
    }

    return result;
  }, [filteredCustomers]);

  const columns: ColumnsType<CustomerTableRow> = [
    {
      title: "Tên khách hàng",
      key: "name",
      render: (_, record) => {
        if (record.rowType === "group") {
          return {
            children: (
              <div className="font-semibold text-foreground">
                Nhóm {record.groupLabel}
              </div>
            ),
            props: {
              colSpan: 7,
            },
          };
        }

        return record.customer.name || "-";
      },
    },
    {
      title: "Mã số thuế",
      key: "taxCode",
      render: (_, record) => {
        if (record.rowType === "group") {
          return { props: { colSpan: 0 } };
        }
        return record.customer.taxCode || "-";
      },
    },
    {
      title: "Điện thoại",
      key: "phone",
      render: (_, record) => {
        if (record.rowType === "group") {
          return { props: { colSpan: 0 } };
        }
        return record.customer.phone || "-";
      },
    },
    {
      title: "Email",
      key: "email",
      render: (_, record) => {
        if (record.rowType === "group") {
          return { props: { colSpan: 0 } };
        }
        return record.customer.email || "-";
      },
    },
    {
      title: "Địa chỉ",
      key: "address",
      render: (_, record) => {
        if (record.rowType === "group") {
          return { props: { colSpan: 0 } };
        }
        return record.customer.address || "-";
      },
    },
    {
      title: "Công nợ",
      key: "totalDebt",
      render: (_, record) => {
        if (record.rowType === "group") {
          return { props: { colSpan: 0 } };
        }
        return formatCurrency(record.customer.totalDebt ?? 0);
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, record) => {
        if (record.rowType === "group") {
          return { props: { colSpan: 0 } };
        }

        const customer = record.customer;

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditDialog(customer)}
              disabled={deletingId === customer.id}
            >
              Sửa
            </Button>

            <Popconfirm
              title="Xóa khách hàng"
              description={`Bạn có chắc muốn xóa "${customer.name || "khách hàng này"}" không?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                loading: deletingId === customer.id,
              }}
              onConfirm={() => handleDeleteCustomer(customer.id)}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={deletingId === customer.id}
              >
                Xóa
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <PageShell>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Quản lý khách hàng</CardTitle>
            <CardDescription>
              Danh sách khách hàng và thông tin cơ bản
            </CardDescription>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <Input
              placeholder="Tìm theo tên, SĐT, email, MST..."
              prefix={<Search className="h-4 w-4" />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-[320px]"
            />
            <Button onClick={handleOpenCreateDialog}>Thêm khách hàng</Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table<CustomerTableRow>
            rowKey={(record) => record.key}
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: search
                ? "Không tìm thấy khách hàng phù hợp."
                : "Chưa có khách hàng",
            }}
            rowClassName={(record) =>
              record.rowType === "group" ? "bg-muted/40 font-medium" : ""
            }
          />
        </CardContent>
      </Card>

      <CustomerDialog
        open={dialogOpen}
        title={editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}
        submitText={editingCustomer ? "Lưu thay đổi" : "Thêm khách hàng"}
        value={form}
        loading={dialogLoading}
        onChange={setForm}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitCustomer}
      />
    </PageShell>
  );
}