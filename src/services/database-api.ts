import apiClient from "@/lib/api-client";
import { DatabaseAction } from "@/features/database/types/database-change-log.types";


export async function getDatabaseChangeLogs(params?: {
  page?: number;
  size?: number;
  entityName?: string;
  action?: DatabaseAction;
  fromDate?: string;
  toDate?: string;
}) {
  const res = await apiClient.get("/admin/database-change-logs", { params });
  return res.data.data;
}