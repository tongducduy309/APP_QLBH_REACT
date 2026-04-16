import apiClient  from "@/lib/api-client";
import type {
  SalesAnalysisResponse,
  StatisticsMode,
} from "@/features/statistics/types/statistics.types";

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

const endpointMap: Record<StatisticsMode, string> = {
  date: "/analysis/date-summary",
  weekly: "/analysis/weekly-summary",
  monthly: "/analysis/monthly-summary",
  quarterly: "/analysis/quarterly-summary",
  yearly: "/analysis/yearly-summary",
};

export async function getStatisticsSummary(
  mode: StatisticsMode,
  start: string,
  end: string
): Promise<SalesAnalysisResponse> {
  const endpoint = endpointMap[mode];

  const { data } = await apiClient.get<ApiResponse<SalesAnalysisResponse>>(endpoint, {
    params: { start, end },
  });

  return data.data;
}