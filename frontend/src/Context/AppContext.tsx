import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { UserProfile, Quote, Customer, ProductItem } from "../Type";
import { initialQuotes, initialCustomers } from "../Data/mockData";
import { customerService } from "../Services/customer.service";
import { productService } from "../Services/product.service";
import { quotationService } from "../Services/quotation.service";
import { useAuth } from "./AuthContext";
interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isDbConnected: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  registerUser: (data: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  quotes: Quote[];
  customers: Customer[];
  products: ProductItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  addQuote: (quote: Omit<Quote, "id" | "createdAt">) => Promise<Quote>;

  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;

  updateQuoteStatus: (
    id: string,
    status: Quote["status"],
    note?: string,
  ) => Promise<void>;

  deleteQuote: (id: string) => Promise<void>;
  addCustomer: (
    customer: Omit<
      Customer,
      "id" | "createdAt" | "totalQuotesCount" | "totalValue" | "openQuotesCount"
    >,
  ) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (
    product: Omit<ProductItem, "id" | "createdAt">,
  ) => Promise<ProductItem>;
  updateProduct: (id: string, product: Partial<ProductItem>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  seedDatabase: () => Promise<void>;
  clearDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    user,
    token,
    isAuthenticated,
    login,
    register: registerUser,
    logout,
    updateProfile,
  } = useAuth();

  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isDbConnected] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // const isAuthenticated = Boolean(token && user?.id);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Helper mapper from MongoDB _id to id
  const mapMongoId = (item: any) => {
    if (!item) return item;
    const { _id, ...rest } = item;
    return {
      id: _id ? String(_id) : item.id || `id-${Math.random()}`,
      ...rest,
    };
  };

  // Check health and fetch MongoDB data
  const fetchDataFromApi = async () => {
    try {
      // Customers
      const customerResponse = await customerService.getCustomers();

      if (customerResponse.success && Array.isArray(customerResponse.data)) {
        setCustomers(customerResponse.data);
      }

      // Products
      const productResponse = await productService.getProducts();

      if (productResponse.success && Array.isArray(productResponse.data)) {
        setProducts(productResponse.data);
      }

      // Quotations
      const quoteResponse = await quotationService.getQuotes();

      if (quoteResponse.success && Array.isArray(quoteResponse.data)) {
        setQuotes(quoteResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch application data:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    fetchDataFromApi();
  }, [isAuthenticated, token]);

  // SEED DATABASE
  const seedDatabase = async () => {
    try {
      const res = await fetch("/api/system/seed", {
        method: "POST",
        headers: getHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        showToast("MongoDB Atlas seeded successfully!");
        fetchDataFromApi();
      } else {
        showToast(json.error || "Failed to seed database.", "error");
      }
    } catch (err: any) {
      showToast("Error seeding MongoDB database", "error");
    }
  };

  // CLEAR DATABASE
  const clearDatabase = async () => {
    try {
      const res = await fetch("/api/system/clear", {
        method: "POST",
        headers: getHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        setQuotes([]);
        setCustomers([]);
        setProducts([]);
        showToast("Database cleared successfully! All collections are empty.");
      } else {
        showToast(json.error || "Failed to clear database.", "error");
      }
    } catch (err: any) {
      showToast("Error clearing MongoDB database", "error");
    }
  };

  // ADD QUOTE
  const addQuote = async (
    quoteData: Omit<Quote, "id" | "createdAt">,
  ): Promise<Quote> => {
    try {
      const response = await quotationService.createQuote(quoteData);

      if (!response.success) {
        throw new Error("Failed to create quotation");
      }

      setQuotes((prev) => [response.data, ...prev]);

      showToast("Quotation created successfully", "success");

      return response.data;
    } catch (error) {
      console.error("Create quotation error:", error);

      showToast("Failed to create quotation", "error");

      throw error;
    }
  };

  // UPDATE QUOTE
  const updateQuote = async (
  id: string,
  updated: Partial<Quote>
): Promise<void> => {
  try {
    const response = await quotationService.updateQuote(
      id,
      updated
    );

    if (!response.success) {
      throw new Error(
        response.message || "Failed to update quotation"
      );
    }

    setQuotes((prev) =>
      prev.map((quote) =>
        quote.id === id ? response.data : quote
      )
    );

    showToast(
      response.message || "Quotation updated successfully",
      "success"
    );
  } catch (error: any) {
    console.error("Update quotation error:", error);

    showToast(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update quotation",
      "error"
    );

    throw error;
  }
};
  // UPDATE QUOTE STATUS
  const updateQuoteStatus = async (
    id: string,
    status: Quote["status"],
    note?: string,
  ): Promise<void> => {
    try {
      const response = await quotationService.updateQuoteStatus(
        id,
        status,
        note,
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to update quotation status",
        );
      }

      setQuotes((prev) =>
        prev.map((quote) => (quote.id === id ? response.data : quote)),
      );

      showToast(
        response.message || "Quotation status updated successfully",
        "success",
      );
    } catch (error: any) {
      console.error("Update quotation status error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update quotation status",
        "error",
      );

      throw error;
    }
  };

  // DELETE QUOTE
  const deleteQuote = async (id: string) => {
    try {
      await quotationService.deleteQuote(id);

      setQuotes((prev) => prev.filter((quote) => quote.id !== id));

      showToast("Quotation deleted successfully", "success");
    } catch (error) {
      console.error("Delete quotation error:", error);

      showToast("Failed to delete quotation", "error");

      throw error;
    }
  };

  // ADD CUSTOMER
  const addCustomer = async (
    cData: Omit<
      Customer,
      "id" | "createdAt" | "totalQuotesCount" | "totalValue" | "openQuotesCount"
    >,
  ): Promise<Customer> => {
    try {
      const response = await customerService.createCustomer({
        name: cData.name,
        company: cData.company,
        email: cData.email,
        phone: cData.phone,
        role: cData.role,

        address: cData.address,
        city: cData.city,
        state: cData.state,
        zip: cData.zip,
        country: cData.country,

        taxId: cData.taxId,

        status: cData.status,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create customer");
      }

      const customer = {
        ...response.data,
        id: String(response.data._id || response.data.id),
        openQuotesCount: response.data.openQuotesCount ?? 0,
      };

      setCustomers((prev) => [customer, ...prev]);

      showToast(
        `Customer ${customer.company || customer.name} saved to MongoDB Atlas!`,
        "success",
      );

      return customer;
    } catch (error: any) {
      console.error("Create customer error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create customer",
        "error",
      );

      throw error;
    }
  };

  // UPDATE CUSTOMER
  const updateCustomer = async (id: string, updated: Partial<Customer>) => {
    try {
      const response = await customerService.updateCustomer(id, updated);

      if (!response.success) {
        throw new Error(response.message || "Failed to update customer");
      }

      const updatedCustomer = {
        ...response.data,
        id: String(response.data._id || response.data.id),
        openQuotesCount: response.data.openQuotesCount ?? 0,
      };

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id ? updatedCustomer : customer,
        ),
      );

      showToast("Customer updated successfully!", "success");
    } catch (error: any) {
      console.error("Update customer error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update customer",
        "error",
      );

      throw error;
    }
  };

  // DELETE CUSTOMER
  const deleteCustomer = async (id: string) => {
    try {
      const response = await customerService.deleteCustomer(id);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete customer");
      }

      setCustomers((prev) => prev.filter((customer) => customer.id !== id));

      showToast("Customer deleted successfully.", "info");
    } catch (error: any) {
      console.error("Delete customer error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete customer",
        "error",
      );

      throw error;
    }
  };

  // ADD PRODUCT
  const addProduct = async (
    pData: Omit<ProductItem, "id" | "createdAt">,
  ): Promise<ProductItem> => {
    try {
      const response = await productService.createProduct({
        type: pData.type,
        name: pData.name,
        sku: pData.sku,
        category: pData.category,
        description: pData.description,
        unitPrice: pData.unitPrice,
        costPrice: pData.costPrice,
        taxStatus: pData.taxStatus,
        stockLevel: pData.stockLevel,
        billingUnit: pData.billingUnit,
        status: pData.status,
      });

      if (!response.success) {
        throw new Error("Failed to create product");
      }

      const product = response.data as ProductItem;

      setProducts((prev) => [product, ...prev]);

      showToast(`Item "${product.name}" saved to MongoDB Atlas!`, "success");

      return product;
    } catch (error: any) {
      console.error("Create product error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create product",
        "error",
      );

      throw error;
    }
  };

  // UPDATE PRODUCT
  const updateProduct = async (
    id: string,
    updated: Partial<ProductItem>,
  ): Promise<void> => {
    try {
      const response = await productService.updateProduct(id, updated);

      if (!response.success) {
        throw new Error("Failed to update product");
      }

      const product = response.data as ProductItem;

      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));

      showToast("Catalog item updated successfully!", "success");
    } catch (error: any) {
      console.error("Update product error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product",
        "error",
      );

      throw error;
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      const response = await productService.deleteProduct(id);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));

      showToast("Catalog item deleted successfully.", "info");
    } catch (error: any) {
      console.error("Delete product error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete product",
        "error",
      );

      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isDbConnected,
        login,
        registerUser,
        logout,
        updateProfile,
        quotes,
        customers,
        products,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        addQuote,
        updateQuote,
        updateQuoteStatus,
        deleteQuote,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        seedDatabase,
        clearDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
