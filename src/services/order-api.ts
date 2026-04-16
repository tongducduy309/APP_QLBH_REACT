import { OrderCreateReq } from "@/features/sales/types/sales.types";
import apiClient from "@/lib/api-client";
import { OrderRecentRes, OrderRes, OrderUpdateReq, PayOrderReq, SendInvoiceEmailReq } from "@/types/order";

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

export async function updateOrder(
  id: string,
  req: OrderUpdateReq
): Promise<OrderRes> {
  const { data } = await apiClient.put(`/orders/${id}`, req, {
    headers: { "Content-Type": "application/json" },
  });
  return data.data as OrderRes;
}



export async function getRecentOrders(amount: number): Promise<OrderRecentRes[]> {
  const { data } = await apiClient.get(`/orders/recent?amount=${amount}`);
  return (data.data ?? []) as OrderRecentRes[];
}

export async function getOrderById(id: number): Promise<OrderRes> {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data.data as OrderRes;
}

export async function cancelOrder(id: number): Promise<void> {
  await apiClient.delete(`/orders/${id}`);
}

export async function payOrder(payload: PayOrderReq) {
  const { data } = await apiClient.post(`/orders/amount`, payload);
  return data;
}



export async function sendInvoiceEmail(req: SendInvoiceEmailReq): Promise<void> {
  const formData = new FormData();
  formData.append("to", req.to);
  formData.append("subject", req.subject ?? "");
  formData.append("content", req.content ?? "");
  formData.append(
    "pdfFile",
    req.pdfBlob,
    req.fileName ?? `hoa-don-${req.orderId}.pdf`
  );

  await apiClient.post(`/orders/${req.orderId}/send-email`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}