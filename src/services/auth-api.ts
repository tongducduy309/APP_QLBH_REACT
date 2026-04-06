import { apiClient } from "@/lib/api-client";
import type { LoginReq, LoginRes } from "@/features/auth/types/auth.types";


export async function login(payload: LoginReq): Promise<LoginRes> {
  const {data} = await apiClient.post("/auth/login", payload);

  return data.data;
}

export async function introspect(token: string): Promise<boolean> {
  const {data} = await apiClient.post("/auth/introspect", {token});

  return data.data;
}