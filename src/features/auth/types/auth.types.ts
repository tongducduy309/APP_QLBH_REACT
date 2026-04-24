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
}

export interface AuthRes {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUserRes;
  active:boolean;
}
