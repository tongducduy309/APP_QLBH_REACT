export interface LoginReq {
  username: string;
  password: string;
}

export interface AuthUserRes {
  id: number | string;
  username: string;
  fullName?: string;
  role?: string;
}

export interface AuthRes {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUserRes;
  active:boolean;
}
