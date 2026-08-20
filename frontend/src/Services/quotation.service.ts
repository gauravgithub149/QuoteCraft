import Api from "./Api";
import type { Quote } from "../Type";

interface QuoteApiData extends Omit<Quote, "id"> {
  _id: string;
}

export interface CreateQuotePayload {
  quoteNumber: string;

  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerAddress?: string;

  date: string;
  validUntil: string;

  items: Quote["items"];

  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;

  status?: Quote["status"];

  notes?: string;
  terms?: string;
  preparedBy?: string;
}

class QuotationService {
  // GET ALL QUOTES
  async getQuotes() {
    const response = await Api.get<{
      success: boolean;
      count: number;
      data: QuoteApiData[];
    }>("/quotes");

    return {
      ...response.data,

      data: response.data.data.map((quote) => ({
        ...quote,
        id: quote._id,
      })),
    };
  }

  // GET SINGLE QUOTE
  async getQuoteById(id: string) {
    const response = await Api.get<{
      success: boolean;
      data: QuoteApiData;
    }>(`/quotes/${id}`);

    return {
      ...response.data,

      data: {
        ...response.data.data,
        id: response.data.data._id,
      },
    };
  }

  // CREATE QUOTE
  async createQuote(
  data: CreateQuotePayload
): Promise<{
  success: boolean;
  message: string;
  data: Quote;
}> {
  const response = await Api.post<{
    success: boolean;
    message: string;
    data: QuoteApiData;
  }>("/quotes", data);

  const quote = response.data.data;

  return {
    success: response.data.success,
    message: response.data.message,

    data: {
      ...quote,
      id: quote._id,
    },
  };
}

  // UPDATE QUOTE
  async updateQuote(
  id: string,
  data: Partial<CreateQuotePayload>
): Promise<{
  success: boolean;
  message: string;
  data: Quote;
}> {
  const response = await Api.put<{
    success: boolean;
    message: string;
    data: QuoteApiData;
  }>(`/quotes/${id}`, data);

  const quote = response.data.data;

  return {
    success: response.data.success,
    message: response.data.message,

    data: {
      ...quote,
      id: quote._id,
    },
  };
}

  // UPDATE STATUS
  async updateQuoteStatus(
    id: string,
    status: Quote["status"],
    note?: string
  ) {
    const response = await Api.patch<{
      success: boolean;
      message: string;
      data: QuoteApiData;
    }>(`/quotes/${id}/status`, {
      status,
      note,
    });

    return {
      ...response.data,

      data: {
        ...response.data.data,
        id: response.data.data._id,
      },
    };
  }

  // DELETE QUOTE
  async deleteQuote(id: string) {
    const response = await Api.delete<{
      success: boolean;
      message: string;
    }>(`/quotes/${id}`);

    return response.data;
  }
}

export const quotationService = new QuotationService();