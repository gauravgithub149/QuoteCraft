import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileText,
} from "lucide-react";

import { useApp } from "../Context/AppContext";
import type { Quote } from "../Type";
import { Badge } from "../Components/ui/Badge";

export const QuotationsList: React.FC = () => {
  const { quotes, deleteQuote, addQuote, showToast, user } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Use only statuses currently supported by backend
  const filterTabs = [
    "All",
    "Draft",
    "Sent",
    "Accepted",
    "Rejected",
    "Expired",
  ];

  // ==========================
  // FILTER QUOTES
  // ==========================

  const filteredQuotes = quotes.filter((q) => {
    const matchesTab = activeTab === "All" || q.status === activeTab;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      q.quoteNumber?.toLowerCase().includes(search) ||
      q.customerCompany?.toLowerCase().includes(search) ||
      q.customerName?.toLowerCase().includes(search) ||
      q.customerEmail?.toLowerCase().includes(search);

    return matchesTab && matchesSearch;
  });

  // ==========================
  // STATISTICS
  // ==========================

  const totalValue = quotes.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  const acceptedCount = quotes.filter((q) => q.status === "Accepted").length;

  const pendingCount = quotes.filter(
    (q) => q.status === "Draft" || q.status === "Sent",
  ).length;

  const rejectedCount = quotes.filter((q) => q.status === "Rejected").length;

  // ==========================
  // DUPLICATE QUOTE
  // ==========================

  const handleDuplicate = async (quote: Quote) => {
    try {
      const duplicated = await addQuote({
        quoteNumber: `QC-${new Date().getFullYear()}-${Math.floor(
          100 + Math.random() * 900,
        )}`,

        customerId: quote.customerId,
        customerName: quote.customerName,
        customerCompany: quote.customerCompany,
        customerEmail: quote.customerEmail,
        customerAddress: quote.customerAddress || "",

        date: new Date().toISOString().split("T")[0],

        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],

        items: quote.items.map((item) => ({
          ...item,
          id: `item-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)}`,
        })),

        subtotal: quote.subtotal,
        discount: quote.discount,
        tax: quote.tax,
        grandTotal: quote.grandTotal,

        status: "Draft",

        notes: quote.notes || "",
        terms: quote.terms || "",
        preparedBy: quote.preparedBy || "",
      });

      showToast(
        `Duplicated into new draft quote ${duplicated.quoteNumber}`,
        "success",
      );

      // Open newly created quotation
      navigate(`/quotations/${duplicated.id}`);
    } catch (error) {
      console.error("Duplicate quotation error:", error);

      showToast("Failed to duplicate quotation", "error");
    }
  };

  // ==========================
  // EXPORT CSV
  // ==========================

  const exportCSV = () => {
    const headers =
      "Quote Number,Company,Customer,Email,Date,Valid Until,Amount,Status\n";

    const rows = filteredQuotes
      .map(
        (q) =>
          `"${q.quoteNumber}","${q.customerCompany}","${q.customerName}","${q.customerEmail}","${q.date}","${q.validUntil}",${q.grandTotal},"${q.status}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "QuoteCraft_Quotations_Export.csv";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    showToast("Quotations exported successfully", "success");
  };

  // ==========================
  // DELETE
  // ==========================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quotation?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuote(id);

      showToast("Quotation deleted successfully", "success");
    } catch (error) {
      console.error("Delete quotation error:", error);

      showToast("Failed to delete quotation", "error");
    }
  };

  // ==========================
  // CURRENCY
  // ==========================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* ==========================
          TITLE & TOP BAR
      ========================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
            Quotations
          </h1>

          <p className="text-xs text-[#4d4632]">
            Manage, track, and generate professional sales quotes and commercial
            proposals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 border border-[#d1c6ab] hover:border-[#735c00] bg-white text-[#1f1b11] text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#4d4632]" />

            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate("/quotations/new")}
            className="px-4 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />

            <span>Create Quote</span>
          </button>
        </div>
      </div>

      {/* ==========================
          STATS
      ========================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-2xs">
          <span className="text-xs text-[#4d4632]">Total Pipeline Value</span>

          <div className="text-xl font-bold text-[#1f1b11] mt-1">
            {formatCurrency(totalValue)}
          </div>
        </div>

        {/* Accepted */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-2xs">
          <span className="text-xs text-[#4d4632]">Accepted Quotes</span>

          <div className="text-xl font-bold text-teal-700 mt-1">
            {acceptedCount}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-2xs">
          <span className="text-xs text-[#4d4632]">Pending Review</span>

          <div className="text-xl font-bold text-amber-800 mt-1">
            {pendingCount}
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-2xs">
          <span className="text-xs text-[#4d4632]">Rejected Quotes</span>

          <div className="text-xl font-bold text-red-600 mt-1">
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* ==========================
          FILTER & SEARCH
      ========================== */}

      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#e5e7eb] pb-3">
          {/* Tabs */}

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#f0e7d6] text-[#735c00]"
                    : "text-[#4d4632] hover:bg-[#fff8f0]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quote # or client..."
              className="w-full pl-9 pr-3 py-1.5 border border-[#d1c6ab] rounded-lg text-xs bg-white text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
            />
          </div>
        </div>

        {/* ==========================
            TABLE
        ========================== */}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fff8f0] border-b border-[#e5e7eb] text-[#4d4632] font-semibold">
                <th className="py-3 px-4">Quote No</th>

                <th className="py-3 px-4">Client Company</th>

                <th className="py-3 px-4">Contact</th>

                <th className="py-3 px-4">Date</th>

                <th className="py-3 px-4">Valid Until</th>

                <th className="py-3 px-4">Grand Total</th>

                <th className="py-3 px-4">Status</th>

                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#4d4632]">
                    No quotations found. Try adjusting your search filter or
                    create a new quote!
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-[#faf9f5] transition-colors"
                  >
                    {/* Quote Number */}

                    <td className="py-3.5 px-4 font-bold text-[#1f1b11]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#735c00]" />

                        <span>{q.quoteNumber}</span>
                      </div>
                    </td>

                    {/* Company */}

                    <td className="py-3.5 px-4 font-medium text-[#1f1b11]">
                      {q.customerCompany || "-"}
                    </td>

                    {/* Customer */}

                    <td className="py-3.5 px-4 text-[#4d4632]">
                      {q.customerName || "-"}
                    </td>

                    {/* Date */}

                    <td className="py-3.5 px-4 text-[#4d4632]">{q.date}</td>

                    {/* Valid Until */}

                    <td className="py-3.5 px-4 text-[#4d4632]">
                      {q.validUntil}
                    </td>

                    {/* Grand Total */}

                    <td className="py-3.5 px-4 font-bold text-[#1f1b11]">
                      {formatCurrency(q.grandTotal)}
                    </td>

                    {/* Status */}

                    <td className="py-3.5 px-4">
                      <Badge status={q.status} />
                    </td>

                    {/* Actions */}

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}

                        <button
                          onClick={() => navigate(`/quotations/${q.id}`)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-md"
                          title="View Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}

                        <button
                          onClick={() => navigate(`/quotations/edit/${q.id}`)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-md"
                          title="Edit Quote"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}

                        <button
                          onClick={() => handleDuplicate(q)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-md"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}

                        {(user?.role === "owner" || String(q.userId) === String(user?.id)) && (
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
