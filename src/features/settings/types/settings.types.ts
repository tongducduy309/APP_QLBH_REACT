import { PrintOptions } from "@/features/print/types/print.type";

export type UserSettings = {
  id?: number;
  emailNotify: boolean;
  printOptions?: PrintOptions;
};

export type UpdateUserSettingsReq = {
  emailNotify: boolean;
  printOptions?: PrintOptions;
};