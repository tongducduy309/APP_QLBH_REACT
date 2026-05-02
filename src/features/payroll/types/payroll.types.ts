import { LeaveType } from "@/features/employees/types/employee.types";


export type PayrollLeaveDetail = {
  leaveDate: string;
  leaveType: LeaveType;
  reason?: string;
};

export type PayrollEmployee = {
  employeeId: number;
  fullName: string;
  position?: string;
  code: string;
  phone?: string;
  dateOfBirth?: string;
  salaryDate: string;
  salaryStartDate: string;
  baseSalary: number;
  totalLeaveDays: number;
  leaveDetails: PayrollLeaveDetail[];
};