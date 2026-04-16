import apiClient from "@/lib/api-client";
import type { SearchSuggestion } from "@/types/search";

export async function searchGlobal(keyword: string, limit = 8): Promise<SearchSuggestion[]> {
  const { data } = await apiClient.get("/search", {
    params: {
      q: keyword,
      limit,
    },
  });

  return data;
}