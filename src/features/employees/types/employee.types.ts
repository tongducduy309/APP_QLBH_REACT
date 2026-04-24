import type { UserItem } from "@/types/user";

export type LeaveType = "FULL_DAY" | "HALF_DAY";

export interface EmployeeLeaveItem {
  id: number;
  leaveDate: string;
  leaveType: LeaveType;
  reason?: string;
}

export interface EmployeeItem {
  id: number;
  code: string;
  fullName: string;
  phone?: string;
  address?: string;
  position?: string;
  hireDate?: string;
  active: boolean;
  baseSalary: number;
  createdAt?: string;
  user?: UserItem;

  leaves?: EmployeeLeaveItem[];
  leaveDaysThisMonth?: number;
  onLeaveToday?: boolean;
}

export interface EmployeeCreateReq {
  code: string;
  fullName: string;
  phone?: string;
  address?: string;
  position?: string;
  hireDate?: string;
  baseSalary: number;
  username: string;
  password: string;
  email?: string;
  role: string;
}

export interface EmployeeUpdateReq {
  code: string;
  fullName: string;
  phone?: string;
  address?: string;
  position?: string;
  hireDate?: string;
  baseSalary: number;
  username: string;
  password?: string;
  email?: string;
  role: string;
}

export interface EmployeeLeaveCreateReq {
  leaveDate: string;
  leaveType: LeaveType;
  reason?: string;
}