import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  FileCheck,
  UserPlus,
  Clock,
  Plus,
  ChevronRight,
  Building2,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useApp } from "../Context/AppContext";
import { Badge } from "../Components/ui/Badge";

export const Dashboard: React.FC = () => {
  const { user, quotes, customers, searchQuery } = useApp();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("Last 30 Days");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good evening");
      } else {
        setGreeting("Good night");
      }
    };

    updateGreeting();

    // Keep greeting updated if the dashboard stays open
    const interval = setInterval(updateGreeting, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter quotes based on search query
  const filteredQuotes = quotes.filter(
    (q) =>
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerCompany.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalRevenue = quotes
    .filter((q) => q.status === "Accepted" || q.status === "Paid")
    .reduce((acc, curr) => acc + curr.grandTotal, 0);

  const acceptedCount = quotes.filter(
    (q) => q.status === "Accepted" || q.status === "Paid",
  ).length;
  const pendingCount = quotes.filter(
    (q) =>
      q.status === "Sent" || q.status === "Draft" || q.status === "Pending",
  ).length;
  const overdueQuotes = quotes.filter((q) => q.status === "Overdue");
  const overdueTotal = overdueQuotes.reduce(
    (acc, curr) => acc + curr.grandTotal,
    0,
  );

  const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
};
  const dynamicRevenueData =
    quotes.length > 0
      ? quotes.map((q) => ({ name: q.date, revenue: q.grandTotal }))
      : [{ name: "No Data", revenue: 0 }];

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1f1b11]">
            {greeting}, {user?.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-[#4d4632] mt-0.5">
            Here's what's happening with your quotes and pipeline today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/customers")}
            className="px-3.5 py-2 border border-[#d1c6ab] hover:border-[#735c00] bg-white text-[#1f1b11] text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#4d4632]" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={() => navigate("/products/new")}
            className="px-3.5 py-2 border border-[#d1c6ab] hover:border-[#735c00] bg-white text-[#1f1b11] text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#4d4632]" />
            <span>New Item</span>
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

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#4d4632]">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#1f1b11]">
             {formatCurrency(totalRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-[#4d4632]/80 mt-1">
            {acceptedCount} accepted quote(s)
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#4d4632]">
              Total Quotes
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#1f1b11]">
              {quotes.length}
            </span>
            <span className="text-xs font-semibold text-amber-800">
              {pendingCount} pending
            </span>
          </div>
          <p className="text-[11px] text-[#4d4632]/80 mt-1">
            {acceptedCount} closed & accepted
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#4d4632]">
              Total Clients
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#1f1b11]">
              {customers.length}
            </span>
          </div>
          <p className="text-[11px] text-[#4d4632]/80 mt-1">
            {customers.filter((c) => c.status === "Active").length} active
            client(s)
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#4d4632]">
              Overdue Payments
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#1f1b11]">
             {formatCurrency(overdueTotal)}
            </span>
            <span className="text-xs font-semibold text-red-600">
              {overdueQuotes.length} overdue
            </span>
          </div>
          <p className="text-[11px] text-[#4d4632]/80 mt-1">
            Pending payment follow-ups
          </p>
        </div>
      </div>

      {/* Main Grid: Revenue Overview Chart & Client Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#1f1b11]">
                Revenue Overview
              </h2>
              <p className="text-xs text-[#4d4632]">
                Historical quotation value trended over time
              </p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs border border-[#d1c6ab] rounded-lg px-2.5 py-1.5 bg-white font-medium text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
            >
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dynamicRevenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0e7d6"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#4d4632" }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#4d4632" }}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f1b11",
                    borderRadius: "8px",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [
                    `₹${Number(val).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#735c00"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients Widget */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1f1b11]">Key Clients</h2>
            <button
              onClick={() => navigate("/customers")}
              className="text-xs font-semibold text-[#735c00] hover:underline flex items-center"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1">
            {customers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4d4632]">
                No client records found.
              </div>
            ) : (
              customers.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#fff8f0] cursor-pointer border border-transparent hover:border-[#d1c6ab]/50 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-[#f6eddb] flex items-center justify-center font-bold text-xs text-[#735c00] shrink-0 border border-[#d1c6ab]/60">
                      {c.company
                        ? c.company.substring(0, 2).toUpperCase()
                        : "CU"}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[#1f1b11] truncate">
                        {c.company || c.name}
                      </div>
                      <div className="text-[11px] text-[#4d4632] truncate">
                        {c.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#1f1b11]">
                      ₹{(c.totalValue || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#4d4632]">
                      {c.totalQuotesCount || 0} quotes
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Quotations Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1f1b11]">
              Recent Quotations
            </h2>
            <p className="text-xs text-[#4d4632]">
              Overview of latest created sales quotes
            </p>
          </div>
          <button
            onClick={() => navigate("/quotations")}
            className="text-xs font-semibold text-[#735c00] hover:underline flex items-center"
          >
            All Quotations <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fff8f0] border-b border-[#e5e7eb] text-[#4d4632] font-semibold">
                <th className="py-3 px-4">Quote ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-[#4d4632]"
                  >
                    No quotations found. Create your first quote to get started!
                  </td>
                </tr>
              ) : (
                filteredQuotes.slice(0, 5).map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-[#faf9f5] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#1f1b11]">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1f1b11]">
                        {q.customerCompany || q.customerName}
                      </div>
                      <div className="text-[11px] text-[#4d4632]">
                        {q.customerName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4d4632]">{q.date}</td>
                    <td className="py-3.5 px-4 font-bold text-[#1f1b11]">
                      {formatCurrency(q.grandTotal || 0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={q.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/quotations/${q.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#735c00] hover:bg-[#f6eddb] px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
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
  );
};
