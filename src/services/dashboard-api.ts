import { SalesAnalysisResponse } from "@/features/statistics/types/statistics.types";
import { apiClient } from "@/lib/api-client";
import type { OrderRecentRes } from "@/types/order";


export async function getDashboardSummaryLast24Hours(): Promise<SalesAnalysisResponse> {
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const startStr = formatDateParam(yesterday);
  const endStr = formatDateParam(today);

  const { data } = await apiClient.get(
    `/analysis/date-summary?start=${startStr}&end=${endStr}`
  );

  return data.data;
}

export async function getDashboardRecentOrders(
  amount: number
): Promise<OrderRecentRes[]> {
  const { data } = await apiClient.get(
    `/orders/recent?amount=${amount}`
  );
  return (data.data ?? []) as OrderRecentRes[];
}



function formatDateParam(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}