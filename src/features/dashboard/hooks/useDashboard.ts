import { useEffect, useMemo, useState } from "react";
import {
  getDashboardRecentOrders,
  getDashboardSummaryLast24Hours,
} from "@/services/dashboard-api";
import type { OrderRecentRes } from "@/types/order";
import { DashboardSummary, RevenueBucketRes } from "../types/dashboard.type";

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueBucketRes[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRecentRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);

        const [analysis, orders] = await Promise.all([
          getDashboardSummaryLast24Hours(),
          getDashboardRecentOrders(5),
        ]);

        setSummary(analysis.analysisRes ?? null);
        setRevenueTrend(analysis.buckets ?? []);
        setRecentOrders(orders ?? []);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
        setSummary(null);
        setRevenueTrend([]);
        setRecentOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const normalizedRevenueTrend = useMemo(() => {
    return revenueTrend.map((item) => ({
      ...item,
      name: formatDisplayDate(item.periodStart),
      revenue: Number(item.totalRevenue ?? 0),
    }));
  }, [revenueTrend]);

  return {
    summary,
    revenueTrend: normalizedRevenueTrend,
    recentOrders,
    isLoading,
  };
}

function formatDisplayDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}