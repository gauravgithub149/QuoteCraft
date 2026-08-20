
import type { ProductItem } from "../Type";
import Api from "./Api";

interface ProductApiData extends Omit<ProductItem, "id"> {
  _id: string;
}

export interface CreateProductPayload {
  type: "Product" | "Service";

  name: string;

  sku: string;

  category:
    | "Hardware"
    | "Software"
    | "Services"
    | "Support"
    | "Consulting";

  description: string;

  unitPrice: number;

  costPrice: number;

  taxStatus: "Taxable" | "Exempt" | "Zero-rated";

  stockLevel: number | "Unlimited";

  billingUnit?: "Hour" | "Day" | "Project" | "Month" | "Session";

  status?: "Active" | "Low Stock" | "Draft" | "Inactive";
}

class ProductService {
  // GET ALL PRODUCTS
  async getProducts() {
    const response = await Api.get<{
      success: boolean;
      count: number;
      data: ProductApiData[];
    }>("/products");

    return {
      ...response.data,

      data: response.data.data.map((product) => ({
        ...product,

        id: product._id,
      })),
    };
  }

  // GET PRODUCT BY ID
  async getProductById(id: string) {
    const response = await Api.get<{
      success: boolean;
      data: ProductApiData;
    }>(`/products/${id}`);

    return {
      ...response.data,

      data: {
        ...response.data.data,

        id: response.data.data._id,
      },
    };
  }

  // CREATE PRODUCT
  async createProduct(data: CreateProductPayload) {
    const response = await Api.post<{
      success: boolean;
      message: string;
      data: ProductApiData;
    }>("/products", data);

    return {
      ...response.data,

      data: {
        ...response.data.data,

        id: response.data.data._id,
      },
    };
  }

  // UPDATE PRODUCT
  async updateProduct(
    id: string,
    data: Partial<CreateProductPayload>
  ) {
    const response = await Api.put<{
      success: boolean;
      message: string;
      data: ProductApiData;
    }>(`/products/${id}`, data);

    return {
      ...response.data,

      data: {
        ...response.data.data,

        id: response.data.data._id,
      },
    };
  }

  // DELETE PRODUCT
  async deleteProduct(id: string) {
    const response = await Api.delete<{
      success: boolean;
      message: string;
    }>(`/products/${id}`);

    return response.data;
  }
}

export const productService = new ProductService();