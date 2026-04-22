
import { Role, UserItem } from "@/types/user";



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
  userId?: number;
  username?: string;
  email?: string;
  user:UserItem;
  createdAt?: string;
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
  role: Role;
}