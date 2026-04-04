import { OrderCreateReq } from "@/features/sales/types/sales.types";
import { apiClient } from "@/lib/api-client";
import { OrderRes } from "@/types/order";

export async function getNextOrderCode(): Promise<string> {
  const { data } = await apiClient.get("/orders/next-code");
  return data.data as string;
}

export async function createOrder(req: OrderCreateReq): Promise<OrderRes> {
  const { data } = await apiClient.post("/orders", req, {
    headers: { "Content-Type": "application/json" },
  });
  return data.data as OrderRes;
}

export async function getOrders(): Promise<OrderRes[]> {
  const { data } = await apiClient.get("/orders");
  return (data.data ?? []) as OrderRes[];
}