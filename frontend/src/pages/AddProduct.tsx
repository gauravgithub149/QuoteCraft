import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useApp } from "../Context/AppContext";
import type { ProductCategory, ProductItem, ProductStatus } from "../Type";

export const AddProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, showToast } = useApp();

  const existingProduct = isEditMode ? products.find((p) => p.id === id) : null;

  // Form states
  const [type, setType] = useState<"Product" | "Service">("Product");
  const [name, setName] = useState("");
  const [sku, setSku] = useState(
    `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const [category, setCategory] = useState<ProductCategory>("Hardware");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | "">(1299);
  const [costPrice, setCostPrice] = useState<number | "">(850);
  const [taxStatus, setTaxStatus] = useState<
    "Taxable" | "Exempt" | "Zero-rated"
  >("Taxable");
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(false);
  const [stockLevel, setStockLevel] = useState<number | "">(45);
  const [billingUnit, setBillingUnit] = useState<
    "Hour" | "Day" | "Project" | "Month" | "Session"
  >("Hour");
  const [status, setStatus] = useState<ProductStatus>("Active");

  useEffect(() => {
    if (existingProduct) {
      setType(existingProduct.type);
      setName(existingProduct.name);
      setSku(existingProduct.sku);
      setCategory(existingProduct.category);
      setDescription(existingProduct.description);
      setUnitPrice(existingProduct.unitPrice);
      setCostPrice(existingProduct.costPrice);
      setTaxStatus(existingProduct.taxStatus);
      setBillingUnit(existingProduct.billingUnit ?? "Hour");
      if (existingProduct.stockLevel === "Unlimited") {
        setIsUnlimitedStock(true);
        setStockLevel("");
      } else {
        setIsUnlimitedStock(false);
        setStockLevel(Number(existingProduct.stockLevel));
      }
      setStatus(existingProduct.status);
    }
  }, [existingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || unitPrice === "") {
      showToast("Please provide an Item Name and Unit Price", "error");
      return;
    }

    const productStockLevel: ProductItem["stockLevel"] =
      isUnlimitedStock || type === "Service"
        ? "Unlimited"
        : Number(stockLevel || 0);

    const payload = {
      type,
      name,
      sku,
      category,
      description,
      unitPrice: Number(unitPrice),
      costPrice: Number(costPrice || 0),
      taxStatus,
      stockLevel: productStockLevel,
      billingUnit: type === "Service" ? billingUnit : undefined,
      status,
    };

    try {
      if (isEditMode && existingProduct) {
        await updateProduct(existingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      navigate("/products");
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="p-2 border border-[#d1c6ab] hover:bg-[#f6eddb] text-[#1f1b11] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1f1b11]">
              {isEditMode
                ? `Edit Catalog Item (${sku})`
                : "Add Item to Product Catalog"}
            </h1>
            <p className="text-xs text-[#4d4632]">
              Configure SKU metadata, pricing, tax, and inventory
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider">
            BASIC INFORMATION
          </h2>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-2">
              Item Classification
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setType("Product")}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === "Product"
                    ? "bg-[#facc15] text-[#1f1b11] border-[#735c00]"
                    : "bg-white text-[#4d4632] border-[#d1c6ab]"
                }`}
              >
                Product (Physical / SW Hardware)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("Service");
                  setIsUnlimitedStock(true);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === "Service"
                    ? "bg-[#facc15] text-[#1f1b11] border-[#735c00]"
                    : "bg-white text-[#4d4632] border-[#d1c6ab]"
                }`}
              >
                Service (Consulting / Hours)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Server Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                SKU / Code *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-mono text-[#1f1b11]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11]"
            >
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Services">Services</option>
              <option value="Support">Support</option>
              <option value="Consulting">Consulting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed commercial description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-[#d1c6ab] rounded-lg text-xs text-[#1f1b11]"
            />
          </div>
        </div>

        {/* Pricing & Cost Card */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider">
            PRICING & TAX
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                {type === "Service"
                  ? "Service Rate (₹) *"
                  : "Selling Unit Price (₹) *"}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={unitPrice}
                onChange={(e) =>
                  setUnitPrice(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-bold text-[#1f1b11]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                {type === "Service" ? "Cost Rate (₹)" : "Unit Cost Price (₹)"}
              </label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) =>
                  setCostPrice(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Tax Status
              </label>
              <select
                value={taxStatus}
                onChange={(e) => setTaxStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11]"
              >
                <option value="Taxable">Taxable Standard</option>
                <option value="Exempt">Exempt</option>
                <option value="Zero-rated">Zero-rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory & Status Card */}
        {/* Inventory / Billing & Status Card */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider">
            {type === "Service" ? "BILLING & STATUS" : "INVENTORY & STATUS"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {type === "Service" ? (
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Billing Unit
                </label>

                <select
                  value={billingUnit}
                  onChange={(e) =>
                    setBillingUnit(
                      e.target.value as
                        | "Hour"
                        | "Day"
                        | "Project"
                        | "Month"
                        | "Session",
                    )
                  }
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11]"
                >
                  <option value="Hour">Hour</option>
                  <option value="Day">Day</option>
                  <option value="Project">Project</option>
                  <option value="Month">Month</option>
                  <option value="Session">Session</option>
                </select>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1f1b11]">
                    Stock Level
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-[#4d4632] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedStock}
                      onChange={(e) => setIsUnlimitedStock(e.target.checked)}
                      className="rounded text-[#735c00]"
                    />

                    <span>Unlimited</span>
                  </label>
                </div>

                <input
                  type="number"
                  disabled={isUnlimitedStock}
                  value={isUnlimitedStock ? "" : stockLevel}
                  onChange={(e) =>
                    setStockLevel(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder={isUnlimitedStock ? "Unlimited" : "45"}
                  className="w-full px-3 py-2 border border-[#d1c6ab] disabled:bg-[#f0e7d6]/30 rounded-lg text-xs font-semibold text-[#1f1b11]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                Catalog Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-lg text-xs font-medium text-[#1f1b11]"
              >
                <option value="Active">Active</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-5 py-2.5 border border-[#d1c6ab] text-[#4d4632] font-semibold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEditMode ? "Update Item" : "Save Item"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
