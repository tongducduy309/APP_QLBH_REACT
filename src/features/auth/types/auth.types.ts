import { Role } from "@/types/user";

export interface LoginReq {
  username: string;
  password: string;
}

export interface AuthUserRes {
  id: number | string;
  username: string;
  fullName?: string;
  roles?: Role[];
  code?: string;
  email?: string;
  position?: string;
}

export interface AuthRes {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUserRes;
  active:boolean;
}
