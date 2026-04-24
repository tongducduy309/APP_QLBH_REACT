import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  activateEmployee,
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "@/services/employee-api";
import type {
  EmployeeCreateReq,
  EmployeeItem,
  EmployeeUpdateReq,
} from "../types/employee.types";
import { removeVietnameseTones } from "@/utils/string";

const PAGE_SIZE = 10;

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

function normalize(value: string) {
  return removeVietnameseTones(value || "").toLowerCase().trim();
}

export function useEmployeePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeCreateReq>(initialForm);

  const keyword = searchParams.get("keyword") || "";
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);

  const setKeyword = (value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value.trim()) {
      next.set("keyword", value);
    } else {
      next.delete("keyword");
    }

    next.set("page", "1");
    setSearchParams(next);
  };

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách nhân viên.");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = normalize(keyword);
    if (!q) return employees;

    return employees.filter((item) => {
      return (
        normalize(item.code).includes(q) ||
        normalize(item.fullName).includes(q) ||
        normalize(item.phone || "").includes(q) ||
        normalize(item.position || "").includes(q) ||
        normalize(item.user?.username || "").includes(q) ||
        normalize(item.user?.email || "").includes(q)
      );
    });
  }, [employees, keyword]);

  const total = filteredEmployees.length;

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, page]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
    if (page > maxPage) {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(maxPage));
      setSearchParams(next);
    }
  }, [filteredEmployees.length, page, searchParams, setSearchParams]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingEmployeeId(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (employee: EmployeeItem) => {
    setEditingEmployeeId(employee.id);
    setIsEditing(true);
    setForm({
      code: employee.code || "",
      fullName: employee.fullName || "",
      phone: employee.phone || "",
      address: employee.address || "",
      position: employee.position || "",
      hireDate: employee.hireDate || "",
      baseSalary: employee.baseSalary || 0,
      username: employee.user?.username || "",
      password: "",
      email: employee.user?.email || "",
      role: Array.isArray((employee.user as any)?.roles)
        ? (employee.user as any).roles[0]
        : ((employee.user as any)?.role ?? "OFFICE_STAFF"),
    });
    setIsDialogOpen(true);
  };

  const openDetail = (employee: EmployeeItem) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (isEditing && editingEmployeeId) {
        await updateEmployee(editingEmployeeId, form as EmployeeUpdateReq);
        toast.success("Cập nhật nhân viên thành công.");
      } else {
        await createEmployee(form);
        toast.success("Tạo nhân viên thành công.");
      }

      setIsDialogOpen(false);
      resetForm();
      await loadEmployees();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Không thể cập nhật nhân viên." : "Không thể tạo nhân viên.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeItem) => {
    try {
      await deleteEmployee(employee.id);
      toast.success("Xóa nhân viên thành công.");
      await loadEmployees();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa nhân viên.");
    }
  };

  const handleActivateEmployee = async (employee: EmployeeItem) => {
    try {
      await activateEmployee(employee.id);
      toast.success("Kích hoạt nhân viên thành công.");
      await loadEmployees();
    } catch (error) {
      console.error(error);
      toast.error("Không thể kích hoạt nhân viên.");
    }
  };

  return {
    employees,
    filteredEmployees,
    paginatedEmployees,
    total,
    page,
    pageSize: PAGE_SIZE,
    keyword,
    setKeyword,
    setPage,

    isDialogOpen,
    setIsDialogOpen,
    isEditing,
    isSubmitting,
    form,
    setForm,

    resetForm,
    openCreateDialog,
    openEditDialog,
    openDetail,
    handleSubmit,
    handleDeleteEmployee,
    handleActivateEmployee,
  };
}