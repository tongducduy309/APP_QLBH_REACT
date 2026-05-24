import { PrintOptions } from "@/features/print/types/print.type";

export type UserSettings = {
  id?: number;
  printOptions?: PrintOptions;
};

export type UpdateUserSettingsReq = {
  printOptions?: PrintOptions;
};