import apiClient from "@/lib/api-client";
import type {
  EmployeeCreateReq,
  EmployeeItem,
  EmployeeLeaveCreateReq,
  EmployeeLeaveItem,
  EmployeeUpdateReq,
} from "@/features/employees/types/employee.types";

type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export async function getEmployees(): Promise<EmployeeItem[]> {
  const { data } = await apiClient.get<ApiResponse<EmployeeItem[]>>("/employees");
  return data.data;
}

export async function getEmployeeById(id: number | string): Promise<EmployeeItem> {
  const { data } = await apiClient.get<ApiResponse<EmployeeItem>>(`/employees/${id}`);
  return data.data;
}

export async function createEmployee(payload: EmployeeCreateReq): Promise<EmployeeItem> {
  const { data } = await apiClient.post<ApiResponse<EmployeeItem>>("/employees", payload);
  return data.data;
}

export async function updateEmployee(
  id: number | string,
  payload: EmployeeUpdateReq
): Promise<EmployeeItem> {
  const { data } = await apiClient.put<ApiResponse<EmployeeItem>>(`/employees/${id}`, payload);
  return data.data;
}

export async function deleteEmployee(id: number | string): Promise<void> {
  await apiClient.delete(`/employees/${id}`);
}

export async function activateEmployee(id: number | string): Promise<EmployeeItem> {
  const { data } = await apiClient.put<ApiResponse<EmployeeItem>>(`/employees/${id}/activate`);
  return data.data;
}

export async function getEmployeeLeaves(
  id: number | string,
  from?: string,
  to?: string
): Promise<EmployeeLeaveItem[]> {
  const { data } = await apiClient.get<ApiResponse<EmployeeLeaveItem[]>>(
    `/employees/${id}/leaves`,
    {
      params: { from, to },
    }
  );

  return data.data;
}

export async function markEmployeeLeave(
  id: number | string,
  payload: EmployeeLeaveCreateReq
): Promise<EmployeeLeaveItem> {
  const { data } = await apiClient.post<ApiResponse<EmployeeLeaveItem>>(
    `/employees/${id}/leaves`,
    payload
  );

  return data.data;
}

export async function deleteEmployeeLeave(
  id: number | string,
  leaveDate: string
): Promise<void> {
  await apiClient.delete(`/employees/${id}/leaves`, {
    params: { leaveDate },
  });
}