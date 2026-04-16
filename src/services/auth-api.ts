import apiClient from "@/lib/api-client";
import type { AuthRes, LoginReq } from "@/features/auth/types/auth.types";


export async function login(payload: LoginReq): Promise<AuthRes> {
  const {data} = await apiClient.post("/auth/login", payload);

  return data.data;
}

export async function introspect(token: string): Promise<AuthRes> {
  const {data} = await apiClient.post("/auth/introspect", {token});

  return data.data;
}