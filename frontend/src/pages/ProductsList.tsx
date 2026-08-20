import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { useApp } from "../Context/AppContext";
import { Badge } from "../Components/ui/Badge";

export const ProductsList: React.FC = () => {
  const { products, deleteProduct } = useApp();
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "All Categories",
    "Hardware",
    "Software",
    "Services",
    "Support",
  ];

  const filteredProducts = products.filter((p) => {
    const matchesType = activeType === "All" || p.type === activeType;
    const matchesCategory =
      selectedCategory === "All Categories" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
            Products & Services Catalog
          </h1>
          <p className="text-xs text-[#4d4632]">
            Central catalog of standard offerings, SKU pricing, and stock
            levels.
          </p>
        </div>
        <button
          onClick={() => navigate("/products/new")}
          className="px-4 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#e5e7eb] pb-3">
          <div className="flex items-center gap-1">
            {["All", "Product", "Service"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeType === type
                    ? "bg-[#f0e7d6] text-[#735c00]"
                    : "text-[#4d4632] hover:bg-[#fff8f0]"
                }`}
              >
                {type === "All" ? "All Items" : `${type}s`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-[#d1c6ab] rounded-lg px-2.5 py-1.5 bg-white font-medium text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-[#4d4632] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SKU or item name..."
                className="w-full pl-9 pr-3 py-1.5 border border-[#d1c6ab] rounded-lg text-xs bg-white text-[#1f1b11] focus:outline-none focus:border-[#735c00]"
              />
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fff8f0] border-b border-[#e5e7eb] text-[#4d4632] font-semibold">
                <th className="py-3 px-4">Item Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-xs text-[#4d4632]"
                  >
                    No products or services found. Click "Add New Item" to
                    create one!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#faf9f5] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1f1b11]">{p.name}</div>
                      <div className="text-[11px] text-[#4d4632] font-mono">
                        {p.sku}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1f1b11]">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-[#4d4632]">{p.type}</td>
                    <td className="py-3.5 px-4 font-bold text-[#1f1b11]">
                      ₹{(p.unitPrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-[#4d4632]">
                      ₹{(p.costPrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.stockLevel === "Unlimited" ? (
                        <span className="text-[#4d4632] italic">Unlimited</span>
                      ) : (
                        <span
                          className={`font-semibold ${
                            Number(p.stockLevel) <= 5
                              ? "text-amber-800"
                              : "text-[#1f1b11]"
                          }`}
                        >
                          {p.stockLevel} units
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/products/edit/${p.id}`)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-md"
                          title="Edit Item"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete Item"
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
    </div>
  );
};
