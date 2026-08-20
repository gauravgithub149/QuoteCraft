import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Pencil,
} from "lucide-react";

import { useApp } from "../Context/AppContext";
import { Badge } from "../Components/ui/Badge";

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { customers, quotes } = useApp();

  // Find customer
  const customer = customers.find((item) => item.id === id);

  // Customer not found
  if (!customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-[#d1c6ab] mb-4" />

          <h1 className="text-xl font-bold text-[#1f1b11]">
            Customer not found
          </h1>

          <p className="text-sm text-[#4d4632] mt-2">
            The customer you are looking for does not exist.
          </p>

          <button
            onClick={() => navigate("/customers")}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#facc15] rounded-lg font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Customers
          </button>
        </div>
      </div>
    );
  }

  // Find quotes for this customer
  const customerQuotes = quotes.filter((quote) => {
    return (
      quote.customerId === customer.id ||
      (quote.customerCompany &&
        customer.company &&
        quote.customerCompany
          .toLowerCase()
          .includes(customer.company.toLowerCase()))
    );
  });

  // Calculate total account value
  const totalAccountValue = customerQuotes.reduce(
    (total, quote) => total + Number(quote.grandTotal || 0),
    0,
  );

  // Open quotations
  const openQuotes = customerQuotes.filter(
    (quote) =>
      quote.status !== "Accepted" &&
      quote.status !== "Rejected" &&
      quote.status !== "Expired",
  );

  // Closed/accepted quotations
  const closedQuotes = customerQuotes.filter(
    (quote) => quote.status === "Accepted",
  );

  const lifetimeClosedValue = closedQuotes.reduce(
    (total, quote) => total + Number(quote.grandTotal || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/customers")}
            className="p-2 border border-[#d1c6ab] hover:bg-[#f6eddb] text-[#1f1b11] rounded-lg transition-colors"
            title="Back to customers"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1f1b11]">
                {customer.company}
              </h1>

              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                Enterprise Account
              </span>
            </div>

            <p className="text-xs text-[#4d4632]">
              Primary Contact:{" "}
              <span className="font-semibold">{customer.name}</span>
              {customer.role && <> ({customer.role})</>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Customer */}

          <button
            onClick={() =>
              navigate("/customers", {
                state: {
                  editCustomerId: customer.id,
                },
              })
            }
            className="px-4 py-2.5 border border-[#d1c6ab] hover:bg-[#f6eddb] text-[#1f1b11] text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit Customer
          </button>

          {/* New Quote */}

          <button
            onClick={() =>
              navigate(`/quotations/new?customerId=${customer.id}`)
            }
            className="px-4 py-2.5 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Quote
          </button>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Account Value */}

        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <span className="text-xs font-medium text-[#4d4632]">
            Total Account Value
          </span>

          <div className="text-2xl font-bold text-[#1f1b11] mt-2">
            ₹{totalAccountValue.toLocaleString("en-IN")}
          </div>

          <p className="text-xs text-[#4d4632] mt-1">
            {customerQuotes.length} total quote
            {customerQuotes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Open Quotes */}

        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <span className="text-xs font-medium text-[#4d4632]">
            Open Quotes
          </span>

          <div className="text-2xl font-bold text-amber-800 mt-2">
            {openQuotes.length}
          </div>

          <p className="text-xs text-[#4d4632] mt-1">
            Active quotation
            {openQuotes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Closed Deals */}

        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
          <span className="text-xs font-medium text-[#4d4632]">
            Lifetime Closed Deals
          </span>

          <div className="text-2xl font-bold text-teal-700 mt-2">
            ₹{lifetimeClosedValue.toLocaleString("en-IN")}
          </div>

          <p className="text-xs text-[#4d4632] mt-1">
            {closedQuotes.length} closed deal
            {closedQuotes.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= ACCOUNT DETAILS ================= */}

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#1f1b11] uppercase tracking-wider border-b border-[#e5e7eb] pb-3">
            ACCOUNT DETAILS
          </h2>

          <div className="space-y-5 mt-5">
            {/* Company */}

            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#735c00] shrink-0 mt-1" />

              <div>
                <div className="text-xs font-semibold text-[#4d4632]">
                  Company
                </div>

                <div className="text-sm font-bold text-[#1f1b11] mt-0.5">
                  {customer.company}
                </div>
              </div>
            </div>

            {/* Contact Person */}

            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#735c00] shrink-0 mt-1" />

              <div>
                <div className="text-xs font-semibold text-[#4d4632]">
                  Contact Person
                </div>

                <div className="text-sm font-bold text-[#1f1b11] mt-0.5">
                  {customer.name}
                </div>

                {customer.role && (
                  <div className="text-xs text-[#4d4632] mt-0.5">
                    {customer.role}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#735c00] shrink-0 mt-1" />

              <div>
                <div className="text-xs font-semibold text-[#4d4632]">
                  Email Address
                </div>

                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm text-[#735c00] hover:underline font-medium break-all"
                  >
                    {customer.email}
                  </a>
                ) : (
                  <div className="text-sm text-[#4d4632]">Not provided</div>
                )}
              </div>
            </div>

            {/* Phone */}

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#735c00] shrink-0 mt-1" />

              <div>
                <div className="text-xs font-semibold text-[#4d4632]">
                  Phone Number
                </div>

                <div className="text-sm font-medium text-[#1f1b11]">
                  {customer.phone || "Not provided"}
                </div>
              </div>
            </div>

            {/* Address */}

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#735c00] shrink-0 mt-1" />

              <div>
                <div className="text-xs font-semibold text-[#4d4632]">
                  Billing Address
                </div>

                <div className="text-sm font-medium text-[#1f1b11] leading-relaxed mt-1">
                  {customer.address && (
                    <>
                      {customer.address}
                      <br />
                    </>
                  )}

                  {(customer.city || customer.state || customer.zip) && (
                    <>
                      {customer.city}
                      {customer.city && customer.state ? ", " : ""}
                      {customer.state}
                      {customer.zip ? ` ${customer.zip}` : ""}
                      <br />
                    </>
                  )}

                  {customer.country || "India"}
                </div>
              </div>
            </div>

            {/* Tax ID */}

            {customer.taxId && (
              <div className="pt-3 border-t border-[#e5e7eb]">
                <div className="text-xs font-semibold text-[#4d4632]">
                  Tax ID
                </div>

                <div className="text-sm font-bold text-[#1f1b11] mt-1">
                  {customer.taxId}
                </div>
              </div>
            )}

            {/* Account Status */}

            <div>
              <div className="text-xs font-semibold text-[#4d4632] mb-2">
                Account Status
              </div>

              <span
                className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                  customer.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : customer.status === "Lead"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {customer.status || "Active"}
              </span>
            </div>
          </div>

          {/* Location */}

          <div className="pt-5 mt-5 border-t border-[#e5e7eb]">
            <div className="h-28 bg-[#fff8f0] rounded-xl border border-[#d1c6ab]/60 flex items-center justify-center text-center p-4">
              <div>
                <MapPin className="w-5 h-5 text-[#735c00] mx-auto mb-2" />

                <span className="text-xs font-semibold text-[#1f1b11]">
                  {customer.city || "Location"}, {customer.country || "India"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= QUOTATION HISTORY ================= */}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1f1b11] uppercase tracking-wider">
                QUOTATION HISTORY
              </h2>

              <p className="text-xs text-[#4d4632] mt-1">
                Quotes associated with this customer
              </p>
            </div>

            <span className="text-xs font-semibold text-[#4d4632]">
              {customerQuotes.length} quotes
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fff8f0] border-b border-[#e5e7eb] text-[#4d4632] font-semibold">
                  <th className="py-3 px-3">Quote ID</th>

                  <th className="py-3 px-3">Date</th>

                  <th className="py-3 px-3">Amount</th>

                  <th className="py-3 px-3">Status</th>

                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5e7eb]">
                {customerQuotes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[#4d4632]"
                    >
                      <div className="flex flex-col items-center">
                        <Eye className="w-8 h-8 opacity-30 mb-3" />

                        <p className="font-medium">No previous quotes found.</p>

                        <p className="text-xs mt-1">
                          Create a new quote for this customer.
                        </p>

                        <button
                          onClick={() =>
                            navigate(
                              `/quotations/new?customerId=${customer.id}`,
                            )
                          }
                          className="mt-4 px-4 py-2 bg-[#facc15] rounded-lg font-semibold flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          New Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customerQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-[#faf9f5]">
                      <td className="py-3 px-3 font-bold text-[#1f1b11]">
                        {quote.quoteNumber || quote.id}
                      </td>

                      <td className="py-3 px-3 text-[#4d4632]">
                        {quote.date ||
                          (quote.createdAt
                            ? new Date(quote.createdAt).toLocaleDateString()
                            : "-")}
                      </td>

                      <td className="py-3 px-3 font-bold text-[#1f1b11]">
                        ₹{Number(quote.grandTotal || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-3">
                        <Badge status={quote.status || "Draft"} />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/quotations/${quote.id}`)}
                          className="text-xs font-semibold text-[#735c00] hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
