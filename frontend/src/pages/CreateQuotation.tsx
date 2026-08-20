import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  Send,
  ArrowLeft,
  Package,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { useApp } from "../Context/AppContext";
import type { LineItem, QuoteStatus } from "../Type";

export const CreateQuotation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const {
    quotes,
    customers,
    products,
    addQuote,
    updateQuote,
    addCustomer,
    showToast,
    user,
  } = useApp();

  const existingQuote = isEditMode ? quotes.find((q) => q.id === id) : null;

  // Form states
  const [quoteNumber, setQuoteNumber] = useState(
    `QC-2026-${Math.floor(100 + Math.random() * 900)}`,
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(10); // 10%
  const [notes, setNotes] = useState(
    "Thank you for choosing QuoteCraft. We look forward to partnering with your team.",
  );
  const [terms, setTerms] = useState(
    "Payment due within 30 days of invoice issuance. Prices valid for 30 days.",
  );

  // Catalog picker modal
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  // Add customer modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [newCustCompany, setNewCustCompany] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  useEffect(() => {
    if (existingQuote) {
      setQuoteNumber(existingQuote.quoteNumber);
      setSelectedCustomerId(existingQuote.customerId);
      setCustomerName(existingQuote.customerName);
      setCustomerCompany(existingQuote.customerCompany);
      setCustomerEmail(existingQuote.customerEmail);
      setCustomerAddress(existingQuote.customerAddress || "");
      setDate(existingQuote.date);
      setValidUntil(existingQuote.validUntil);
      setItems(existingQuote.items);
      setDiscount(existingQuote.discount);
      setTaxRate(existingQuote.tax > 0 ? 10 : 0);
      setNotes(existingQuote.notes || "");
      setTerms(existingQuote.terms || "");
    }
  }, [existingQuote]);

  const handleCustomerChange = (cId: string) => {
    setSelectedCustomerId(cId);
    const c = customers.find((cust) => cust.id === cId);
    if (c) {
      setCustomerName(c.name);
      setCustomerCompany(c.company);
      setCustomerEmail(c.email);
      setCustomerAddress(`${c.address}, ${c.city}, ${c.state} ${c.zip}`);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustName || !newCustCompany) {
      showToast("Name and company are required", "error");
      return;
    }

    try {
      const newC = await addCustomer({
        name: newCustName,
        company: newCustCompany,
        email: newCustEmail,

        phone: "",
        role: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        taxId: "",

        status: "Active",
      });

      // Select newly created customer
      setSelectedCustomerId(newC.id);

      // Fill quotation customer details
      setCustomerName(newC.name);
      setCustomerCompany(newC.company);
      setCustomerEmail(newC.email);
      setCustomerAddress(
        [newC.address, newC.city, newC.state, newC.zip]
          .filter(Boolean)
          .join(", "),
      );

      // Close Quick Add Customer modal
      setCustomerModalOpen(false);

      // Clear quick-add form
      setNewCustName("");
      setNewCustCompany("");
      setNewCustEmail("");

      showToast("Customer added successfully", "success");
    } catch (error) {
      console.error("Failed to create customer:", error);
      showToast("Failed to create customer", "error");
    }
  };

  const handleItemChange = (id: string, field: keyof LineItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === "qty" || field === "unitPrice") {
            updated.amount = Number(updated.qty) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const handleAddItemRow = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "",
      qty: 1,
      unitPrice: 0,
      amount: 0,
      category: "Services",
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItemRow = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInsertFromCatalog = (product: any) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: `${product.name}\n${product.description}`,
      qty: 1,
      unitPrice: product.unitPrice,
      amount: product.unitPrice,
      category: product.category,
    };
    setItems((prev) => [...prev, newItem]);
    setCatalogModalOpen(false);
    showToast(`Added "${product.name}" to line items`);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const tax = Math.round((subtotal - discount) * (taxRate / 100));
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handleSave = async (status: QuoteStatus) => {
  if (!selectedCustomerId) {
    showToast("Please select a customer", "error");
    return;
  }

  if (items.length === 0) {
    showToast("Please add at least one line item", "error");
    return;
  }

  const payload = {
    quoteNumber,
    customerId: selectedCustomerId,
    customerName,
    customerCompany,
    customerEmail,
    customerAddress,
    date,
    validUntil,
    items,
    subtotal,
    discount,
    tax,
    grandTotal,
    status,
    notes,
    terms,
    preparedBy: user?.name || "QuoteCraft User",
  };

  try {
    if (isEditMode && existingQuote) {
      await updateQuote(existingQuote.id, payload);
      navigate(`/quotations/${existingQuote.id}`);
    } else {
      const created = await addQuote(payload);
      navigate(`/quotations/${created.id}`);
    }
  } catch (error) {
    console.error("Failed to save quotation:", error);
    showToast("Failed to save quotation", "error");
  }
};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/quotations")}
            className="p-2 border border-[#d1c6ab] hover:bg-[#f6eddb] text-[#1f1b11] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1f1b11]">
              {isEditMode
                ? `Edit Quotation ${quoteNumber}`
                : "Create New Quotation"}
            </h1>
            <p className="text-xs text-[#4d4632]">
              Assemble proposal items, pricing, and commercial terms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/ai-assistant")}
            className="px-3.5 py-2 bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Proposal Generator</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave("Draft")}
            className="px-3.5 py-2 border border-[#d1c6ab] hover:border-[#735c00] bg-white text-[#1f1b11] text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-[#4d4632]" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave("Sent")}
            className="px-4 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Customer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1f1b11] uppercase tracking-wider">
                CUSTOMER DETAILS
              </h2>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(true)}
                className="text-xs font-semibold text-[#735c00] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Customer</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Select Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
              >
                <option value="">Select Customer</option>

                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-[#4d4632] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#4d4632] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-xs text-[#1f1b11]"
                />
              </div>
            </div>
          </div>

          {/* Quote Meta Dates & Ref */}
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Quote Reference #
              </label>
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-bold text-[#1f1b11]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11]"
              />
            </div>
          </div>

          {/* Line Items Table Builder */}
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1f1b11] uppercase tracking-wider">
                LINE ITEMS
              </h2>
              <button
                type="button"
                onClick={() => setCatalogModalOpen(true)}
                className="px-3 py-1.5 bg-[#f6eddb] hover:bg-[#f0e7d6] text-[#735c00] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Browse Product Catalog</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 border border-[#e5e7eb] rounded-xl bg-[#faf9f5] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#735c00]">
                      Item #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(item.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded-md"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      placeholder="Item name & description..."
                      className="w-full p-2.5 border border-[#d1c6ab] bg-white rounded-lg text-xs text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#4d4632]">
                        QTY
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(item.id, "qty", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-[#d1c6ab] bg-white rounded-lg text-xs font-semibold text-[#1f1b11]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#4d4632]">
                        Unit Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-[#d1c6ab] bg-white rounded-lg text-xs font-semibold text-[#1f1b11]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#4d4632]">
                        Amount
                      </label>
                      <div className="px-2.5 py-1.5 bg-[#f0e7d6]/60 rounded-lg text-xs font-bold text-[#1f1b11] border border-[#d1c6ab]/60">
                        {formatCurrency(item.amount || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItemRow}
              className="w-full py-2.5 border-2 border-dashed border-[#d1c6ab] hover:border-[#735c00] hover:bg-[#fff8f0] text-[#735c00] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Row</span>
            </button>
          </div>
        </div>

        {/* Right Summary Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#1f1b11] uppercase tracking-wider">
              SUMMARY & TOTALS
            </h2>

            <div className="space-y-3 text-xs text-[#1f1b11]">
              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-[#4d4632]">Subtotal:</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4d4632] mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#d1c6ab] rounded-lg text-xs font-semibold text-[#1f1b11]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4d4632] mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-[#d1c6ab] rounded-lg text-xs font-semibold text-[#1f1b11]"
                />
              </div>

              <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                <span className="text-[#4d4632]">Calculated Tax:</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between py-3 px-4 bg-[#f0e7d6] rounded-xl font-bold text-base text-[#1f1b11] border border-[#d1c6ab]">
                  <span>Grand Total:</span>
                  <span className="text-[#735c00]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1f1b11] uppercase tracking-wider mb-1">
                CUSTOMER NOTES
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1f1b11] uppercase tracking-wider mb-1">
                TERMS & CONDITIONS
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-2.5 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Product Selection Modal */}
      {catalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
              <h3 className="text-base font-bold text-[#1f1b11]">
                Insert Product / Service from Catalog
              </h3>
              <button
                onClick={() => setCatalogModalOpen(false)}
                className="text-[#4d4632] hover:text-[#1f1b11]"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleInsertFromCatalog(p)}
                  className="flex items-center justify-between p-3 border border-[#e5e7eb] hover:border-[#735c00] hover:bg-[#fff8f0] rounded-xl cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-bold text-xs text-[#1f1b11]">
                      {p.name} ({p.sku})
                    </div>
                    <div className="text-[11px] text-[#4d4632]">
                      {p.description}
                    </div>
                  </div>
                  <div className="text-right font-bold text-xs text-[#735c00] shrink-0">
                    ${p.unitPrice.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Customer Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
              <h3 className="text-base font-bold text-[#1f1b11]">
                Quick Add Customer
              </h3>
              <button
                onClick={() => setCustomerModalOpen(false)}
                className="text-[#4d4632]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="px-3 py-1.5 border border-[#d1c6ab] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#facc15] text-[#1f1b11] font-bold text-xs rounded-lg shadow-2xs"
                >
                  Create & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
