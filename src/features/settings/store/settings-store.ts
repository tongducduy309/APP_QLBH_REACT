import { create } from "zustand";
import type { UserSettings } from "../types/settings.types";
import { getMySettings, updateMySettings } from "@/services/settings-api";
import { toast } from "sonner";

export const defaultSettings: UserSettings = {
  printOptions: {
    paperSize: "A4",
    copies: 1,
    pageOrientation: "portrait",
    deviceName: "",
  },
};

type SettingsState = {
  settings: UserSettings;
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  saveSettings: (payload: UserSettings) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  loading: false,
  hydrated: false,

  async hydrate() {
    set({ loading: true });

    try {
      const settings = await getMySettings();
      set({ settings, hydrated: true });
    } catch {
      set({ settings: defaultSettings, hydrated: true });
    } finally {
      set({ loading: false });
    }
  },

  async saveSettings(payload) {
    set({ loading: true });

    try {
      const settings = await updateMySettings(payload);
      set({ settings });
      toast.success("Lưu cài đặt thành công");
    } catch {
      throw new Error("Không thể lưu cài đặt lên máy chủ");
    } finally {
      set({ loading: false });
    }
  },
}));