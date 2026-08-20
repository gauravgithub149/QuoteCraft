import Api from "./Api";
import type { Customer } from "../Type";

interface CustomerApiData extends Omit<Customer, "id" | "openQuotesCount"> {
  _id: string;
  openQuotesCount?: number;
}

export interface CreateCustomerPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  status?: "Active" | "Lead" | "Inactive";
}

class CustomerService {

  async getCustomers() {
    const response = await Api.get<{
      success: boolean;
      count: number;
      data: CustomerApiData[];
    }>("/customers");

    return {
      ...response.data,
      data: response.data.data.map((customer) => ({
        ...customer,
        id: customer._id,
        openQuotesCount: customer.openQuotesCount ?? 0,
      })),
    };
  }

  async getCustomerById(id: string) {
    const response = await Api.get<{
      success: boolean;
      data: CustomerApiData;
    }>(`/customers/${id}`);

    return {
      ...response.data,
      data: {
        ...response.data.data,
        id: response.data.data._id,
        openQuotesCount:
          response.data.data.openQuotesCount ?? 0,
      },
    };
  }

  async createCustomer(data: CreateCustomerPayload) {
    const response = await Api.post<{
      success: boolean;
      message: string;
      data: CustomerApiData;
    }>("/customers", data);

    return {
      ...response.data,
      data: {
        ...response.data.data,
        id: response.data.data._id,
        openQuotesCount:
          response.data.data.openQuotesCount ?? 0,
      },
    };
  }

  async updateCustomer(
    id: string,
    data: Partial<CreateCustomerPayload>
  ) {
    const response = await Api.put<{
      success: boolean;
      message: string;
      data: CustomerApiData;
    }>(`/customers/${id}`, data);

    return {
      ...response.data,
      data: {
        ...response.data.data,
        id: response.data.data._id,
        openQuotesCount:
          response.data.data.openQuotesCount ?? 0,
      },
    };
  }

  async deleteCustomer(id: string) {
    const response = await Api.delete<{
      success: boolean;
      message: string;
    }>(`/customers/${id}`);

    return response.data;
  }
}

export const customerService = new CustomerService();