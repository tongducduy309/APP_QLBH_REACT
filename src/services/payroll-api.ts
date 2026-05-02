

import apiClient from "@/lib/api-client";

export async function getPayroll(salaryDate: string) {
  const res = await apiClient.get("/payroll", {
    params: {
      salaryDate,
    },
  });

  return res.data.data ?? res.data ?? [];
}

export async function getPayrollById(salaryDate: string, employeeId: number) {
  const res = await apiClient.get(`/payroll/${employeeId}`, {
    params: {
      salaryDate,
    },
  });

  return res.data.data ?? res.data ?? [];
}

export async function getPayrollSetting() {
  const res = await apiClient.get<{ salaryDay: number }>("/payroll/setting");
  return res.data;
}

export async function updatePayrollSetting(salaryDay: number) {
  const res = await apiClient.put<{ salaryDay: number }>("/payroll/setting", {
    salaryDay,
  });

  return res.data;
}