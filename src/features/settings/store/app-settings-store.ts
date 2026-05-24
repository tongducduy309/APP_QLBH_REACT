import { create } from "zustand";
import { updateMySettings } from "@/services/settings-api";
import { AppSettings } from "../types/app-settings.types";
import { getAppSettings, updateAppSettings } from "@/services/app-settings-api";
import { toast } from "sonner";


type SettingsState = {
  appSettings: Partial<AppSettings>;
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  saveSettings: (key: keyof AppSettings, value: any) => Promise<void>;
};

export const useAppSettingsStore = create<SettingsState>((set) => ({
  appSettings: {},
  loading: true,
  hydrated: false,

  async hydrate() {
    set({ loading: true });

    try {
      const settings = await getAppSettings();
      set({ appSettings: settings, hydrated: true });
    } catch {
      set({ appSettings: {}, hydrated: true });
    } finally {
      set({ loading: false });
    }
  },

  async saveSettings(key, value) {
    set({ loading: true });

    try {
      const settings = await updateAppSettings(key, value);
      set({ appSettings: settings });
      toast.success("Cài đặt đã được lưu");
    } catch {
      throw new Error("Không thể lưu cài đặt lên máy chủ");
    } finally {
      set({ loading: false });
    }
  },
}));