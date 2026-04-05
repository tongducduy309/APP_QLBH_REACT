import { apiClient } from "@/lib/api-client";
import type { LoginReq, LoginRes } from "@/features/auth/types/auth.types";


export async function loginApi(payload: LoginReq): Promise<LoginRes> {
  const res = await apiClient.post<LoginRes>("/auth/login", payload);
  return res.data;
}