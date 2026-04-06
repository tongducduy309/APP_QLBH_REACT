export interface LoginReq {
  username: string;
  password: string;
}

export interface AuthUserDto {
  id: number | string;
  username: string;
  fullName?: string;
  role?: string;
}

export interface LoginRes {
  data: LoginRes;
  accessToken: string;
  refreshToken?: string;
  user?: AuthUserDto;
}