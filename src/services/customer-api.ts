import {
  CustomerCreateReq,
  CustomerDetailRes,
  CustomerRes,
  CustomerUpdateReq,
} from "@/features/customers/types/customer.types";
import { apiClient } from "@/lib/api-client";

export async function getCustomers(): Promise<CustomerRes[]> {
  const { data } = await apiClient.get("customers");
  return data.data as CustomerRes[];
}

export async function getCustomerById(id: number): Promise<CustomerDetailRes> {
  const { data } = await apiClient.get(`customers/${id}`);
  return data.data as CustomerDetailRes;
}

export async function createCustomer(
  customer: CustomerCreateReq
): Promise<CustomerRes> {
  const { data } = await apiClient.post("customers", customer, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data.data as CustomerRes;
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`customers/${id}`);
}

export async function updateCustomer(
  id: number,
  req: CustomerUpdateReq
): Promise<CustomerRes> {
  const { data } = await apiClient.put(`customers/${id}`, req, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data.data as CustomerRes;
}