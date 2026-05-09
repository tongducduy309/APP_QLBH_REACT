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

export async function confirmPassword(password: string): Promise<void> {
  await apiClient.post("/auth/confirm-password", {password});
}

export async function checkUsernameNotExists(username: string): Promise<boolean> {
  const response = await apiClient.get<{ data: boolean }>(`/users/check-username?username=${encodeURIComponent(username)}`);
  return response.data.data;
}
