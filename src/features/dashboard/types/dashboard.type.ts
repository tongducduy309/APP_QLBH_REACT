export type DashboardSummary = {
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
