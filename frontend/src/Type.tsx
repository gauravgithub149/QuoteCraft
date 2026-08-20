export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Pending"
  | "Paid"
  | "Rejected"
  | "Expired"
  | "Overdue";

export type ProductStatus = "Active" | "Low Stock" | "Draft" | "Inactive";

export type ProductCategory =
  | "Hardware"
  | "Software"
  | "Services"
  | "Support"
  | "Consulting";
export type BillingUnit =
  | "Unit"
  | "Hour"
  | "Day"
  | "Project"
  | "Month"
  | "Session";

export interface LineItem {
  id: string;

  // Product selected from catalog
  productId?: string;

  description: string;

  qty: number;
  unitPrice: number;
  amount: number;

  category: "Hardware" | "Software" | "Services" | "Support" | "Consulting";

  billingUnit?: BillingUnit;
}

export interface Quote {
  id: string;
  _id?: string;

  userId?: string;

  quoteNumber: string;

  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerAddress?: string;

  date: string;
  validUntil: string;

  items: LineItem[];

  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;

  status: QuoteStatus;

  notes?: string;
  terms?: string;

  preparedBy?: string;

  auditTrail?: AuditTrail[];

  createdAt: string;
  updatedAt?: string;
}
export interface AuditTrail {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  notes?: string;
}

export interface Customer {
  id: string;

  userId?: string;

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

  totalQuotesCount: number;
  totalValue: number;

  // UI compatibility
  openQuotesCount: number;

  status: "Active" | "Lead" | "Inactive";

  createdAt: string;
}
// export interface ProductItem {
//   id: string;
//   name: string;
//   sku: string;
//   category: ProductCategory;
//   description: string;
//   unitPrice: number;
//   costPrice: number;
//   taxStatus: 'Taxable' | 'Exempt' | 'Zero-rated';
//   stockLevel: number | 'Unlimited';
//   status: ProductStatus;
//   type: 'Product' | 'Service';
//   imageUrl?: string;
//   createdAt: string;
// }

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  plan: string;
  avatarUrl: string;
  taxId: string;
  industry: string;
  address: string;

  role: "owner" | "staff";
}

export interface ProductItem {
  id: string;
  _id?: string;

  type: "Product" | "Service";

  name: string;
  sku: string;

  category: "Hardware" | "Software" | "Services" | "Support" | "Consulting";

  description: string;

  unitPrice: number;
  costPrice: number;

  taxStatus: "Taxable" | "Exempt" | "Zero-rated";

  stockLevel: number | "Unlimited";

  billingUnit?: "Hour" | "Day" | "Project" | "Month" | "Session";

  status: "Active" | "Low Stock" | "Draft" | "Inactive";

  userId?: string;

  createdAt?: string;
  updatedAt?: string;
}
