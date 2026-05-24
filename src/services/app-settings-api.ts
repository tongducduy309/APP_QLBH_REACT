import apiClient from "@/lib/api-client";
import type {
  UpdateUserSettingsReq,
} from "@/features/settings/types/settings.types";
import { AppSettings } from "@/features/settings/types/app-settings.types";

export async function getAppSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get("/settings");
  return data.data as AppSettings;
}

export async function updateAppSettings(
  key: keyof AppSettings,
  value: any
): Promise<AppSettings> {
  const { data } = await apiClient.put(`/settings/${key}?value=${value}`);
  return data.data as AppSettings;
}