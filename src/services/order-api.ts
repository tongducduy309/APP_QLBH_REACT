import { apiClient } from "@/lib/api-client";
import type { OrderReq, OrderRes, PaidDeptReq, ResponseEntity } from "@/types/order";

export async function getNextOrderCode(): Promise<string> {
  const { data } = await apiClient.get("/orders/next-code");
  return data.data as string;
}

export async function createOrder(req: OrderReq): Promise<OrderRes> {
  const { data } = await apiClient.post("/orders", req, {
    headers: { "Content-Type": "application/json" },
  });
  return data.data as OrderRes;
}

export async function getOrders(): Promise<OrderRes[]> {
  const { data } = await apiClient.get("/orders");
  return data.data as OrderRes[];
}

export async function getOrderById(id: string): Promise<OrderRes> {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data.data as OrderRes;
}

export async function updateOrder(id: string, req: OrderReq): Promise<OrderRes> {
  const { data } = await apiClient.put(`/orders/${id}`, req);
  return data.data as OrderRes;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient.delete(`/orders/${id}`);
}

export async function paidDeptOrder(req: PaidDeptReq): Promise<ResponseEntity> {
  const { data } = await apiClient.post("/orders/amount", req, {
    headers: { "Content-Type": "application/json" },
  });
  return data as ResponseEntity;
}

export async function checkInventory(req: OrderReq): Promise<string[]> {
  const { data } = await apiClient.post("/inventory/available", req, {
    headers: { "Content-Type": "application/json" },
  });
  return data.data as string[];
}

export async function getDeptOrderByCustomerId(
  customerId: string,
): Promise<OrderRes[]> {
  const { data } = await apiClient.get(`/orders/customer/${customerId}`);
  return (data.data ?? []) as OrderRes[];
}