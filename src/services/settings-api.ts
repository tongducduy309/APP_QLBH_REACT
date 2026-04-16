import apiClient from "@/lib/api-client";
import type {
  UpdateUserSettingsReq,
  UserSettings,
} from "@/features/settings/types/settings.types";

export async function getMySettings(): Promise<UserSettings> {
  const { data } = await apiClient.get("/users/me/settings");
  return data.data as UserSettings;
}

export async function updateMySettings(
  payload: UpdateUserSettingsReq
): Promise<UserSettings> {
  const { data } = await apiClient.put("/users/me/settings", payload);
  return data.data as UserSettings;
}