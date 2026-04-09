export type UserSettings = {
  id?: number;
  appName: string;
  appIcon?: string | null;
  emailNotify: boolean;
  desktopNotify: boolean;
};

export type UpdateUserSettingsReq = {
  appName: string;
  appIcon?: string | null;
  emailNotify: boolean;
  desktopNotify: boolean;
};