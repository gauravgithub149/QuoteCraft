import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

import { useApp } from "../Context/AppContext";
import { Badge } from "../Components/ui/Badge";

interface CustomerFormData {
  company: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  status: "Active" | "Lead" | "Inactive";
}

const emptyForm: CustomerFormData = {
  company: "",
  name: "",
  role: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  taxId: "",
  status: "Active",
};

export const CustomersList: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, showToast } =
    useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Open Add Customer modal when:
  // /customers?add=true
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setEditingId(null);
      setForm(emptyForm);
      setShowModal(true);

      searchParams.delete("add");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filteredCustomers = customers.filter((customer: any) => {
    const value = search.toLowerCase().trim();

    if (!value) return true;

    return (
      customer.company?.toLowerCase().includes(value) ||
      customer.name?.toLowerCase().includes(value) ||
      customer.email?.toLowerCase().includes(value) ||
      customer.phone?.toLowerCase().includes(value)
    );
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (customer: any) => {
    setEditingId(customer.id);

    setForm({
      company: customer.company || "",
      name: customer.name || "",
      role: customer.role || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
      country: customer.country || "India",
      taxId: customer.taxId || "",
      status: customer.status || "Active",
    });

    setShowModal(true);
  };

  useEffect(() => {
    const editCustomerId = location.state?.editCustomerId;

    if (!editCustomerId) {
      return;
    }

    const customer = customers.find((item: any) => item.id === editCustomerId);

    if (customer) {
      openEditModal(customer);
    }

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location.state, customers]);
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateField = (field: keyof CustomerFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.company.trim()) {
      showToast("Company name is required.", "error");
      return;
    }

    if (!form.name.trim()) {
      showToast("Contact name is required.", "error");
      return;
    }

    if (!form.email.trim()) {
      showToast("Email address is required.", "error");
      return;
    }

    setSaving(true);

    try {
      const customerData: any = {
        company: form.company.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        taxId: form.taxId.trim(),
        status: form.status,

        // These will work after adding these fields to backend model.
        role: form.role.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        country: form.country.trim(),
      };

      if (editingId) {
        await updateCustomer(editingId, customerData);
        showToast("Customer updated successfully.");
      } else {
        await addCustomer(customerData);
        showToast("Customer added successfully.");
      }

      closeModal();
    } catch (error) {
      console.error("Customer save error:", error);
      showToast("Failed to save customer.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?",
    );

    if (!confirmed) return;

    await deleteCustomer(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
            Customers Roster
          </h1>

          <p className="text-sm text-[#4d4632] mt-1">
            Directory of enterprise accounts, contacts, and quotation histories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, contact, or email..."
            className="w-full pl-9 pr-3 py-2 border border-[#d1c6ab] rounded-lg text-xs bg-white text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fff8f0] border-b border-[#e5e7eb] text-[#4d4632] font-semibold">
                <th className="py-3 px-4">Company</th>

                <th className="py-3 px-4">Contact Person</th>

                <th className="py-3 px-4">Contact Info</th>

                <th className="py-3 px-4">Total Quotes</th>

                <th className="py-3 px-4">Total Value</th>

                <th className="py-3 px-4">Status</th>

                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-xs text-[#4d4632]"
                  >
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />

                    {search
                      ? "No customers match your search."
                      : 'No customer records found. Click "Add Customer" to add your first customer.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-[#faf9f5] transition-colors"
                  >
                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f6eddb] flex items-center justify-center font-bold text-xs text-[#735c00] border border-[#d1c6ab]">
                          {customer.company
                            ? customer.company.substring(0, 2).toUpperCase()
                            : "CU"}
                        </div>

                        <div>
                          <div
                            onClick={() =>
                              navigate(`/customers/${customer.id}`)
                            }
                            className="font-bold text-[#1f1b11] hover:text-[#735c00] cursor-pointer"
                          >
                            {customer.company || customer.name}
                          </div>

                          <div className="text-[11px] text-[#4d4632]">
                            {customer.city || ""}
                            {customer.state ? `, ${customer.state}` : ""}
                          </div>

                          {customer.taxId && (
                            <div className="text-[10px] text-[#4d4632] mt-0.5">
                              Tax ID: {customer.taxId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1f1b11]">
                        {customer.name}
                      </div>

                      <div className="text-[11px] text-[#4d4632]">
                        {customer.role || "Primary Contact"}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-[#1f1b11] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#4d4632]" />
                        <span>{customer.email}</span>
                      </div>

                      {customer.phone && (
                        <div className="text-[#4d4632] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#4d4632]" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Total Quotes */}
                    <td className="py-3.5 px-4 font-semibold text-[#1f1b11]">
                      {customer.totalQuotesCount ?? customer.totalQuotes ?? 0}
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-4 font-bold text-[#1f1b11]">
                      ₹{(customer.totalValue || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={customer.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-md"
                          title="View Customer Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-md"
                          title="Edit Customer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <CustomerModal
          form={form}
          editing={Boolean(editingId)}
          saving={saving}
          onChange={updateField}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

interface CustomerModalProps {
  form: CustomerFormData;
  editing: boolean;
  saving: boolean;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  form,
  editing,
  saving,
  onChange,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
          <div>
            <h3 className="text-base font-bold text-[#1f1b11]">
              {editing ? "Edit Customer" : "Add New Customer"}
            </h3>

            <p className="text-[11px] text-[#4d4632] mt-1">
              Add customer account and contact information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-lg p-1.5 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3 text-xs">

          {/* Company */}
          <div>
            <label className="block font-semibold text-[#1f1b11] mb-1">
              Company Name *
            </label>

            <input
              value={form.company}
              onChange={(e) =>
                onChange("company", e.target.value)
              }
              placeholder="Acme Corporation"
              className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Contact Name *
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  onChange("name", e.target.value)
                }
                placeholder="Sarah Jenkins"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Title / Role
              </label>

              <input
                value={form.role}
                onChange={(e) =>
                  onChange("role", e.target.value)
                }
                placeholder="Procurement Manager"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

          </div>

          {/* Email / Phone */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Email Address *
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  onChange("email", e.target.value)
                }
                placeholder="sarah@acmecorp.com"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Phone Number
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  onChange("phone", e.target.value)
                }
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-[#1f1b11] mb-1">
              Street Address
            </label>

            <input
              value={form.address}
              onChange={(e) =>
                onChange("address", e.target.value)
              }
              placeholder="1200 Manufacturing Blvd"
              className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
            />
          </div>

          {/* City / State / Zip */}
          <div className="grid grid-cols-3 gap-3">

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                City
              </label>

              <input
                value={form.city}
                onChange={(e) =>
                  onChange("city", e.target.value)
                }
                placeholder="Bhubaneswar"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                State
              </label>

              <input
                value={form.state}
                onChange={(e) =>
                  onChange("state", e.target.value)
                }
                placeholder="Odisha"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Zip Code
              </label>

              <input
                value={form.zip}
                onChange={(e) =>
                  onChange("zip", e.target.value)
                }
                placeholder="751001"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

          </div>

          {/* Country / Tax ID / Status */}
          <div className="grid grid-cols-3 gap-3">

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Country
              </label>

              <input
                value={form.country}
                onChange={(e) =>
                  onChange("country", e.target.value)
                }
                placeholder="India"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Tax ID
              </label>

              <input
                value={form.taxId}
                onChange={(e) =>
                  onChange("taxId", e.target.value)
                }
                placeholder="GSTIN / Tax ID"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1f1b11] mb-1">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  onChange(
                    "status",
                    e.target.value as CustomerFormData["status"]
                  )
                }
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Lead">Lead</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e7eb]">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-[#d1c6ab] rounded-lg font-semibold text-[#4d4632] hover:bg-[#f6eddb] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#facc15] text-[#1f1b11] font-bold rounded-lg shadow-2xs hover:bg-[#facc15]/90 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Update Customer"
                  : "Save Customer"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};
