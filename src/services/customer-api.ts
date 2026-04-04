import { CustomerCreateReq, CustomerRes, CustomerUpdateReq } from "@/features/customers/types/customer.types";
import { apiClient } from "@/lib/api-client";


export async function getCustomers(): Promise<CustomerRes[]> {
  const { data } = await apiClient.get('customers');
  return data.data as CustomerRes[];
}

// async getCustomerById(id: string): Promise<CustomerRes | null> {
//   try {
//     const { data } = await this.apiClient.get(`customers/${id}`);
//     return data.data as CustomerRes
//   } catch (err: unknown) {
//     console.log(err)
//     throw new Error(axios.isAxiosError(err) ? err.response?.data?.message : "Đã xảy ra lỗi. Vui lòng thử lại");
//   }
// }

export async function createCustomer(customer: CustomerCreateReq): Promise<CustomerRes> {
  const { data } = await apiClient.post('customers', customer, { headers: { 'Content-Type': 'application/json' } });
  return data.data as CustomerRes;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`customers/${id}`);
}

export async function updateCustomer(id: string, req: CustomerUpdateReq): Promise<CustomerRes> {
  const { data } = await apiClient.put(`customers/${id}`, req, { headers: { 'Content-Type': 'application/json' } });
  return data.data as CustomerRes;
}