import { EmployeeItem, EmployeeUpdateReq } from "../types/employee.types";

export function buildEmployeeUpdateReq(
  employee: EmployeeItem
): EmployeeUpdateReq {
  return {
    code: employee.code,
    fullName: employee.fullName,
    phone: employee.phone ?? "",
    address: employee.address ?? "",
    position: employee.position ?? "",
    hireDate: employee.hireDate ?? "",
    baseSalary: employee.baseSalary ?? 0,
    username: employee.user?.username ?? "",
    email: employee.user?.email ?? "",
    // role: employee.user?.roles ?? employee.role ?? "",
    role: employee.user?.roles[0] ?? "",
    password: "", 
  };
}