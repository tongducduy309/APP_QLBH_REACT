export type StatisticsMode = "date" | "weekly" | "monthly" | "quarterly" | "yearly";

export type AnalysisRes = {
  totalOrders: number;
  totalRevenue: number;
  totalGrossProfit: number;
  totalAmountPaid: number;
  totalDebt: number;
  totalShippingFee: number;
};

export type RevenueBucketRes = {
  periodStart: string;
  totalOrders: number;
  totalRevenue: number;
};

export type SalesAnalysisResponse = {
  analysisRes: AnalysisRes;
  buckets: RevenueBucketRes[];
};