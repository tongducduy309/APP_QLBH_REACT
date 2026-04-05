export interface LoginReq {
  username: string;
  password: string;
}

export interface LoginRes {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: number | string;
    username: string;
    fullName?: string;
    role?: string;
  };
}