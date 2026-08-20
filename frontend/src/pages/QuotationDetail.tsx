import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Send,
  Edit,
  FileText,
  Mail,
  X,
} from "lucide-react";
import { useApp } from "../Context/AppContext";
import type { QuoteStatus } from "../Type";
import { Badge } from "../Components/ui/Badge";

export const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, updateQuoteStatus, user, showToast } = useApp();
  console.log("Quotation Detail User:", user);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const quote = quotes.find((q) => q.id === id) || quotes[0];
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  if (!quote) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-[#1f1b11]">
          Quotation not found
        </h2>
        <Link
          to="/quotations"
          className="text-xs font-semibold text-[#735c00] hover:underline mt-2 inline-block"
        >
          Return to quotations list
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const openEmailModal = () => {
    setEmailRecipient(quote.customerEmail || "contact@client.com");
    setEmailSubject(`Quotation ${quote.quoteNumber} from ${user?.companyName}`);
    setEmailBody(
      `Dear ${quote.customerName},
            Please find attached quotation ${quote.quoteNumber} for ₹${quote.grandTotal.toLocaleString("en-IN")}.
            Valid until: ${quote.validUntil}.
            Best regards,
            ${user?.name || "QuoteCraft User"}
            ${user?.companyName || ""}`,
    );
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // Only owner can change quotation status to Sent.
    if (user?.role === "owner") {
      await updateQuoteStatus(quote.id, "Sent");
    }

    setEmailModalOpen(false);

    showToast(
      `Quotation ${quote.quoteNumber} emailed to ${emailRecipient}!`,
      "success"
    );
  } catch (error) {
    console.error("Send quotation email error:", error);

    showToast(
      "Failed to send quotation email.",
      "error"
    );
  }
};

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (user?.role !== "owner") {
      showToast("Only the owner can change quotation status.", "error");
      return;
    }

    try {
      await updateQuoteStatus(quote.id, newStatus);

      showToast(`Quotation status changed to ${newStatus}.`, "success");
    } catch (error) {
      console.error("Update quotation status error:", error);

      showToast("Failed to update quotation status.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Toolbar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/quotations")}
            className="p-2 border border-[#d1c6ab] hover:bg-[#f6eddb] text-[#1f1b11] rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1f1b11]">
                {quote.quoteNumber}
              </h1>
              <Badge status={quote.status} />
            </div>
            <p className="text-xs text-[#4d4632]">
              Prepared for {quote.customerCompany}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {user?.role === "owner" ? (
            <select
              value={quote.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as QuoteStatus)
              }
              className="text-xs border border-[#d1c6ab] rounded-lg px-2.5 py-1.5 bg-white font-semibold text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
            >
              <option value="Draft">Status: Draft</option>
              <option value="Sent">Status: Sent</option>
              <option value="Accepted">Status: Accepted</option>
              <option value="Rejected">Status: Rejected</option>
              <option value="Expired">Status: Expired</option>
            </select>
          ) : (
            <div className="px-2.5 py-1.5 border border-[#d1c6ab] rounded-lg bg-[#faf9f5] text-xs font-semibold text-[#1f1b11]">
              Status: {quote.status}
            </div>
          )}

          <button
            onClick={() => navigate(`/quotations/edit/${quote.id}`)}
            className="px-3 py-1.5 border border-[#d1c6ab] hover:border-[#735c00] bg-white text-[#1f1b11] text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-[#4d4632]" />
            <span>Edit</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 border border-[#d1c6ab] hover:border-[#735c00] bg-white text-[#1f1b11] text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#4d4632]" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={openEmailModal}
            className="px-3.5 py-1.5 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Document */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-8 sm:p-12 print-card">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-8 border-b border-[#e5e7eb]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-[#facc15] flex items-center justify-center font-bold text-[#1f1b11]">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-bold text-[#1f1b11]">
                {user?.companyName}
              </span>
            </div>
            <p className="text-xs text-[#4d4632] leading-relaxed max-w-xs">
              {user?.address}
              <br />
              Tax ID / VAT: {user?.taxId}
              <br />
              {user?.email}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-extrabold text-[#1f1b11] tracking-tight uppercase">
              QUOTATION
            </h2>
            <div className="mt-2 text-xs space-y-1 text-[#4d4632]">
              <p>
                <span className="font-semibold text-[#1f1b11]">Quote No:</span>{" "}
                {quote.quoteNumber}
              </p>
              <p>
                <span className="font-semibold text-[#1f1b11]">Date:</span>{" "}
                {quote.date}
              </p>
              <p>
                <span className="font-semibold text-[#1f1b11]">
                  Valid Until:
                </span>{" "}
                {quote.validUntil}
              </p>
            </div>
          </div>
        </div>

        {/* Client Billing Info */}
        <div className="py-6 border-b border-[#e5e7eb] grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#735c00]">
              PREPARED FOR:
            </span>
            <h3 className="text-base font-bold text-[#1f1b11] mt-1">
              {quote.customerCompany}
            </h3>
            <p className="text-xs text-[#4d4632] mt-0.5">
              {quote.customerName}
            </p>
            <p className="text-xs text-[#4d4632] mt-0.5">
              {quote.customerAddress}
            </p>
            <p className="text-xs text-[#4d4632] mt-0.5">
              {quote.customerEmail}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#735c00]">
              QUOTE DETAILS:
            </span>
            <div className="mt-2 text-xs space-y-1.5 text-[#4d4632]">
              <p>
                <span className="font-semibold text-[#1f1b11]">
                  Prepared By:
                </span>{" "}
                {quote.preparedBy || user?.name}
              </p>
              <p>
                <span className="font-semibold text-[#1f1b11]">Status:</span>{" "}
                {quote.status}
              </p>
              <p>
                <span className="font-semibold text-[#1f1b11]">Currency:</span>{" "}
                INR (₹)
              </p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fff8f0] border-b border-[#e5e7eb] text-[#1f1b11] font-bold">
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-center">QTY</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#1f1b11] whitespace-pre-line">
                      {item.description}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-medium text-[#1f1b11]">
                    {item.qty}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-[#1f1b11]">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-[#1f1b11]">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes */}
        <div className="pt-4 border-t border-[#e5e7eb] grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            {quote.notes && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider mb-1">
                  CUSTOMER NOTES
                </h4>
                <p className="text-xs text-[#4d4632] leading-relaxed bg-[#fff8f0] p-3 rounded-xl border border-[#e5e7eb]">
                  {quote.notes}
                </p>
              </div>
            )}
            {quote.terms && (
              <div>
                <h4 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider mb-1">
                  TERMS & CONDITIONS
                </h4>
                <p className="text-[11px] text-[#4d4632] leading-relaxed">
                  {quote.terms}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs text-[#1f1b11]">
            <div className="flex justify-between py-1.5 border-b border-[#e5e7eb]">
              <span className="text-[#4d4632]">Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(quote.subtotal)}
              </span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between py-1.5 border-b border-[#e5e7eb] text-teal-700">
                <span>Discount:</span>
                <span className="font-semibold">
                  -{formatCurrency(quote.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-[#e5e7eb]">
              <span className="text-[#4d4632]">Estimated Tax:</span>
              <span className="font-semibold">{formatCurrency(quote.tax)}</span>
            </div>
            <div className="flex justify-between py-3 font-bold text-base bg-[#f0e7d6]/50 p-3 rounded-xl border border-[#d1c6ab]/60 mt-2">
              <span>Grand Total:</span>
              <span className="text-[#735c00]">
                {formatCurrency(quote.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Sender Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#735c00]" />
                <h3 className="text-base font-bold text-[#1f1b11]">
                  Send Quote via Email
                </h3>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-[#4d4632] hover:text-[#1f1b11] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 border border-[#d1c6ab] rounded-lg text-xs font-semibold text-[#4d4632]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
