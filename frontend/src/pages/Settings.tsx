import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { useApp } from "../Context/AppContext";

export const Settings: React.FC = () => {
  const { user, updateProfile, showToast } = useApp();

  // Profile Information State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company Information State
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [taxId, setTaxId] = useState(user?.taxId || "");
  const [address, setAddress] = useState(user?.address || "");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state if user object updates in context
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setCompanyName(user?.companyName || "");
    setTaxId(user?.taxId || "");
    setAddress(user?.address || "");
    setAvatarPreview('');
  }, [user]);

  // Handle Photo File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrors((prev) => ({
        ...prev,
        file: "Invalid file format. Please upload JPG, JPEG, PNG, or WEBP images only.",
      }));
      showToast(
        "Please select a valid image format (JPG, JPEG, PNG, WEBP).",
        "error",
      );
      return;
    }

    setErrors((prev) => {
      const { file: _, ...rest } = prev;
      return rest;
    });

    // setSelectedFile(file);

    // Create immediate image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo Action
  const handleRemovePhoto = () => {
    // setSelectedFile(null);
    setAvatarPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => {
      const { file: _, ...rest } = prev;
      return rest;
    });
  };

  // Reset / Cancel Changes
  const handleReset = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setCompanyName(user?.companyName || "");
    setTaxId(user?.taxId || "");
    setAddress(user?.address || "");
    setAvatarPreview('');
    // setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setErrors({});
  };

  // Save Settings Form Handler
 const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!user) {
    showToast("User not found", "error");
    return;
  }

  if (!name.trim()) {
    showToast("Name is required", "error");
    return;
  }

  if (!email.trim()) {
    showToast("Email is required", "error");
    return;
  }

  if (!companyName.trim()) {
    showToast("Company name is required", "error");
    return;
  }

  try {
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      address: address.trim(),
      taxId: taxId.trim(),
    });

    showToast("Profile updated successfully", "success");
  } catch (error) {
    showToast(
      error instanceof Error
        ? error.message
        : "Failed to update profile",
      "error"
    );
  }
};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#e5e7eb] pb-4">
        <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-xs text-[#4d4632] mt-1">
          Manage your personal and company information.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {/* 1. PROFILE INFORMATION */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-6">
          <h2 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider border-b border-[#f0f0f0] pb-2">
            PROFILE INFORMATION
          </h2>

          {/* Profile Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1f1b11]">
              Profile Image
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={name || "User"}
                    className="w-16 h-16 rounded-full border-2 border-[#d1c6ab] object-cover shadow-2xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-[#d1c6ab] bg-[#f6eddb] flex items-center justify-center text-[#735c00]">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f0e7d6] hover:bg-[#e6d8bc] text-[#735c00] border border-[#d1c6ab] text-xs font-bold rounded-xl shadow-2xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </label>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl shadow-2xs transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#4d4632]">
                  Accepted formats: JPG, JPEG, PNG, WEBP.
                </p>
                {errors.file && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.file}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Full Name & Email Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Enter full name"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden transition-colors ${
                  errors.name
                    ? "border-red-500 bg-red-50/20 focus:border-red-600"
                    : "border-[#d1c6ab] focus:border-[#735c00]"
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emailAddress"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="emailAddress"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. name@company.com"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden transition-colors ${
                  errors.email
                    ? "border-red-500 bg-red-50/20 focus:border-red-600"
                    : "border-[#d1c6ab] focus:border-[#735c00]"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. COMPANY INFORMATION */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider border-b border-[#f0f0f0] pb-2">
            COMPANY INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="companyName"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName)
                    setErrors((prev) => ({ ...prev, companyName: "" }));
                }}
                placeholder="Enter company legal name"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-hidden transition-colors ${
                  errors.companyName
                    ? "border-red-500 bg-red-50/20 focus:border-red-600"
                    : "border-[#d1c6ab] focus:border-[#735c00]"
                }`}
              />
              {errors.companyName && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.companyName}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="taxId"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                Tax ID / VAT Number
              </label>
              <input
                id="taxId"
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g. US123456789"
                className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-mono focus:border-[#735c00] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-xs font-semibold text-[#1f1b11] mb-1"
            >
              Registered Address
            </label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter official registered company address"
              className="w-full p-2.5 border border-[#d1c6ab] rounded-xl text-xs focus:border-[#735c00] focus:outline-hidden"
            />
          </div>
        </div>

        {/* 3. CHANGE PASSWORD */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1f1b11] uppercase tracking-wider border-b border-[#f0f0f0] pb-2">
            CHANGE PASSWORD
          </h2>

          <div className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword)
                      setErrors((prev) => ({ ...prev, currentPassword: "" }));
                  }}
                  placeholder="Enter current password"
                  className={`w-full px-3 py-2 pr-10 border rounded-xl text-xs focus:outline-hidden transition-colors ${
                    errors.currentPassword
                      ? "border-red-500 bg-red-50/20 focus:border-red-600"
                      : "border-[#d1c6ab] focus:border-[#735c00]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4632] hover:text-[#1f1b11] transition-colors"
                  title={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.currentPassword}</span>
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword)
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  placeholder="Enter new password (min. 6 characters)"
                  className={`w-full px-3 py-2 pr-10 border rounded-xl text-xs focus:outline-hidden transition-colors ${
                    errors.newPassword
                      ? "border-red-500 bg-red-50/20 focus:border-red-600"
                      : "border-[#d1c6ab] focus:border-[#735c00]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4632] hover:text-[#1f1b11] transition-colors"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.newPassword}</span>
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#1f1b11] mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 pr-10 border rounded-xl text-xs focus:outline-hidden transition-colors ${
                    errors.confirmPassword
                      ? "border-red-500 bg-red-50/20 focus:border-red-600"
                      : "border-[#d1c6ab] focus:border-[#735c00]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4632] hover:text-[#1f1b11] transition-colors"
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4 & 5. ACTIONS: CANCEL / RESET AND SAVE SETTINGS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 bg-white hover:bg-[#f6eddb]/60 text-[#4d4632] hover:text-[#1f1b11] border border-[#d1c6ab] font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
