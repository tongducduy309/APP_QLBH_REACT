import { create } from "zustand";
import type { UserSettings } from "../types/settings.types";
import { getMySettings, updateMySettings } from "@/services/settings-api";

const SETTINGS_FALLBACK_KEY = "qlbh_user_settings";

export const defaultSettings: UserSettings = {
  emailNotify: true,
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
  setLocalSettings: (payload: UserSettings) => void;
};

function getStoredSettings(): UserSettings {
  const raw = localStorage.getItem(SETTINGS_FALLBACK_KEY);

  if (!raw) return defaultSettings;

  try {
    return {
      ...defaultSettings,
      ...(JSON.parse(raw) as Partial<UserSettings>),
    };
  } catch {
    return defaultSettings;
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: getStoredSettings(),
  loading: false,
  hydrated: false,

  async hydrate() {
    set({ loading: true });

    try {
      const settings = await getMySettings();
      localStorage.setItem(SETTINGS_FALLBACK_KEY, JSON.stringify(settings));
      set({ settings, hydrated: true });
    } catch {
      set({
        settings: getStoredSettings(),
        hydrated: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  async saveSettings(payload) {
    set({ loading: true });

    try {
      const settings = await updateMySettings(payload);
      localStorage.setItem(SETTINGS_FALLBACK_KEY, JSON.stringify(settings));
      set({ settings });
    } catch {
      localStorage.setItem(SETTINGS_FALLBACK_KEY, JSON.stringify(payload));
      set({ settings: payload });
      throw new Error("Không thể lưu cài đặt lên máy chủ");
    } finally {
      set({ loading: false });
    }
  },

  setLocalSettings(payload) {
    localStorage.setItem(SETTINGS_FALLBACK_KEY, JSON.stringify(payload));
    set({ settings: payload });
  },
}));