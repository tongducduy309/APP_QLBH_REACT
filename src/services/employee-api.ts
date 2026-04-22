
import type {
  EmployeeCreateReq,
  EmployeeItem,
} from "@/features/employees/types/employee.types";
import apiClient from "@/lib/api-client";

export async function getEmployees(): Promise<EmployeeItem[]> {
  const { data } = await apiClient.get("employees");
  return data.data as EmployeeItem[];
}

export async function getEmployeeById(id: number | string): Promise<EmployeeItem> {
  const { data } = await apiClient.get(`employees/${id}`);
  return data.data as EmployeeItem;
}

export async function createEmployee(
  payload: EmployeeCreateReq
): Promise<EmployeeItem> {
  const { data } = await apiClient.post("employees", payload, {
    headers: { "Content-Type": "application/json" },
  });

  return data.data as EmployeeItem;
}