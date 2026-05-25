import { PrintOptions } from "@/features/print/types/print.type";

export type UserSettings = {
  id?: number;
  printOptions?: PrintOptions;
  showCostInSales?: boolean;
};

export type UpdateUserSettingsReq = {
  printOptions?: PrintOptions;
  showCostInSales?: boolean;
};