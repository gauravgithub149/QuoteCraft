import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
  AlertTriangle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { userService } from "../Services/user.service";
import { useApp } from "../Context/AppContext";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "staff";
  status: "active" | "inactive";

  companyName?: string;
  address?: string;
  taxId?: string;
  avatarUrl?: string;

  lastActive: string;
  ownerId?: string;

  createdAt: string;
  updatedAt?: string;
}

// Initial Mock Data for UI Preview Fallback

export const UserManagement: React.FC = () => {
  const { showToast } = useApp();

  // State Management for Staff Users
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "staff">("all");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffUser | null>(null);
  const [statusTogglingStaff, setStatusTogglingStaff] =
    useState<StaffUser | null>(null);

  // Add Form State
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff" as const,
    status: "active" as "active" | "inactive",
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showAddConfirmPassword, setShowAddConfirmPassword] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "staff" as const,
    status: "active" as "active" | "inactive",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Fetch users from backend API
  const fetchStaffList = async () => {
    try {
      setIsLoading(true);

      const response = await userService.getStaffUsers();

      setStaffList(response.data || []);
    } catch (error: any) {
      console.error("Fetch staff users error:", error);

      showToast(
        error.response?.data?.message || "Failed to load staff users.",
        "error",
      );

      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status === "active").length;
    const inactive = staffList.filter((s) => s.status === "inactive").length;
    return { total, active, inactive };
  }, [staffList]);

  // Filtered List
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [staffList, searchQuery, statusFilter, roleFilter]);

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // Handle Add Staff Submit
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    // Validation
    if (!addForm.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!addForm.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!addForm.password) {
      errors.password = "Password is required.";
    } else if (addForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (!addForm.confirmPassword) {
      errors.confirmPassword = "Please confirm password.";
    } else if (addForm.confirmPassword !== addForm.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    try {
      const response = await userService.createStaff({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        status: addForm.status,
      });

      const createdUser: StaffUser = response.data;

      setStaffList((prev) => [createdUser, ...prev]);

      showToast(
        `Staff member "${createdUser.name}" created successfully.`,
        "success",
      );

      // Close ONLY after successful API
      setIsAddModalOpen(false);

      setAddForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "staff",
        status: "active",
      });

      setAddErrors({});
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Failed to create staff member.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setEditForm({
      name: staff.name,
      email: staff.email,
      role: "staff",
      status: staff.status,
    });
    setEditErrors({});
  };

  // Handle Edit Submit
  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const errors: Record<string, string> = {};
    if (!editForm.name.trim()) errors.name = "Full name is required.";
    if (!editForm.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await userService.updateStaff(editingStaff.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        status: editForm.status,
      });

      const updatedUser: StaffUser = response.data;

      setStaffList((prev) =>
        prev.map((item) => (item.id === editingStaff.id ? updatedUser : item)),
      );

      showToast(
        `Staff member "${updatedUser.name}" updated successfully.`,
        "success",
      );
      setEditingStaff(null);
      setEditErrors({});
    } catch (error: any) {
      console.error("Update staff error:", error);

      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update staff member.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;

    const targetId = deletingStaff.id;
    const targetName = deletingStaff.name;

    try {
      await userService.deleteStaff(targetId);

      setStaffList((prev) => prev.filter((item) => item.id !== targetId));

      showToast(
        `Staff member "${targetName}" deleted successfully.`,
        "success",
      );

      setDeletingStaff(null);
    } catch (error: any) {
      console.error("Delete staff error:", error);

      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete staff member.",
        "error",
      );
    }
  };

  // Handle Activate / Deactivate Toggle
  const handleConfirmStatusToggle = async () => {
    if (!statusTogglingStaff) return;

    const nextStatus: "active" | "inactive" =
      statusTogglingStaff.status === "active" ? "inactive" : "active";

    const targetId = statusTogglingStaff.id;
    const targetName = statusTogglingStaff.name;

    try {
      const response = await userService.updateStaffStatus(
        targetId,
        nextStatus,
      );

      const updatedUser = response.data;

      setStaffList((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                status: updatedUser.status,
              }
            : item,
        ),
      );

      showToast(
        `Staff member "${targetName}" is now ${nextStatus}.`,
        nextStatus === "active" ? "success" : "info",
      );

      setStatusTogglingStaff(null);
    } catch (error: any) {
      console.error("Status update error:", error);

      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update staff status.",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1f1b11] tracking-tight">
              User Management
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#f0e7d6] text-[#735c00] border border-[#d1c6ab]">
              Owner Workspace
            </span>
          </div>
          <p className="text-xs text-[#4d4632] mt-1">
            Manage your team members, roles, and access to QuoteCraft.
          </p>
        </div>

        <button
          onClick={() => {
            setAddForm({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
              role: "staff",
              status: "active",
            });
            setAddErrors({});
            setIsAddModalOpen(true);
          }}
          className="self-start sm:self-auto bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Staff</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4d4632] uppercase tracking-wider">
              Total Staff
            </p>
            <p className="text-2xl font-bold text-[#1f1b11] mt-1">
              {metrics.total}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0e7d6] flex items-center justify-center text-[#735c00]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4d4632] uppercase tracking-wider">
              Active Staff
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {metrics.active}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4d4632] uppercase tracking-wider">
              Inactive Staff
            </p>
            <p className="text-2xl font-bold text-slate-600 mt-1">
              {metrics.inactive}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4632]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium focus:border-[#735c00] focus:outline-hidden bg-[#faf9f5]/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#4d4632]" />
            <span className="text-xs font-semibold text-[#4d4632]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium bg-white focus:border-[#735c00] focus:outline-hidden"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#4d4632]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium bg-white focus:border-[#735c00] focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-[#4d4632]">
              Loading staff members...
            </p>
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#faf9f5] border-b border-[#e5e7eb] text-[11px] font-bold text-[#4d4632] uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] text-xs font-medium">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-[#faf9f5]/60 transition-colors"
                  >
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f0e7d6] border border-[#d1c6ab] flex items-center justify-center font-bold text-[#735c00] text-xs shrink-0">
                          {staff.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#1f1b11]">
                          {staff.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-[#4d4632]">
                      {staff.email}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0e7d6] text-[#735c00] border border-[#d1c6ab]">
                        Staff
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {staff.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 text-[#4d4632]">
                      {formatDateTime(staff.createdAt)}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-[#4d4632]">
                      {formatDateTime(staff.lastActive)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-1.5 text-[#4d4632] hover:text-[#1f1b11] hover:bg-[#f6eddb] rounded-lg transition-colors"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setStatusTogglingStaff(staff)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            staff.status === "active"
                              ? "text-amber-700 hover:bg-amber-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={
                            staff.status === "active"
                              ? "Deactivate Staff"
                              : "Activate Staff"
                          }
                        >
                          {staff.status === "active" ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => setDeletingStaff(staff)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Staff Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f0e7d6] text-[#735c00] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f1b11]">
                No staff members yet
              </h3>
              <p className="text-xs text-[#4d4632] max-w-sm mx-auto mt-1">
                Add your first staff member to start managing your QuoteCraft
                team.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Staff</span>
            </button>
          </div>
        )}
      </div>

      {/* Owner Access Informational Section */}
      <div className="bg-[#f0e7d6]/50 rounded-2xl border border-[#d1c6ab] p-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#735c00] shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-[#1f1b11]">Owner Access: </span>
          <span className="text-[#4d4632]">
            Only account owners can manage team members.
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD STAFF MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
              <h3 className="text-base font-bold text-[#1f1b11]">
                Add Staff Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#4d4632] hover:text-[#1f1b11] p-1 rounded-lg hover:bg-[#f6eddb]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddStaffSubmit}
              className="space-y-3"
              noValidate
            >
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                  placeholder="e.g. John Smith"
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden ${
                    addErrors.name
                      ? "border-red-500 bg-red-50/20"
                      : "border-[#d1c6ab] focus:border-[#735c00]"
                  }`}
                />
                {addErrors.name && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{addErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm({ ...addForm, email: e.target.value })
                  }
                  placeholder="john@royalenfield.com"
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden ${
                    addErrors.email
                      ? "border-red-500 bg-red-50/20"
                      : "border-[#d1c6ab] focus:border-[#735c00]"
                  }`}
                />
                {addErrors.email && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{addErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm({ ...addForm, password: e.target.value })
                    }
                    placeholder="Min. 6 characters"
                    className={`w-full px-3 py-2 pr-10 border rounded-xl text-xs font-medium focus:outline-hidden ${
                      addErrors.password
                        ? "border-red-500 bg-red-50/20"
                        : "border-[#d1c6ab] focus:border-[#735c00]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4632]"
                  >
                    {showAddPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {addErrors.password && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{addErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAddConfirmPassword ? "text" : "password"}
                    value={addForm.confirmPassword}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repeat password"
                    className={`w-full px-3 py-2 pr-10 border rounded-xl text-xs font-medium focus:outline-hidden ${
                      addErrors.confirmPassword
                        ? "border-red-500 bg-red-50/20"
                        : "border-[#d1c6ab] focus:border-[#735c00]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddConfirmPassword(!showAddConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4632]"
                  >
                    {showAddConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {addErrors.confirmPassword && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{addErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value="Staff"
                    disabled
                    className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-bold bg-[#f6eddb]/50 text-[#735c00] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                    Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm({ ...addForm, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium bg-white focus:border-[#735c00] focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#d1c6ab] hover:bg-[#f6eddb]/50 text-[#4d4632] font-semibold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs rounded-xl shadow-2xs transition-all"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT STAFF MODAL */}
      {/* ========================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
              <h3 className="text-base font-bold text-[#1f1b11]">
                Edit Staff Member
              </h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-[#4d4632] hover:text-[#1f1b11] p-1 rounded-lg hover:bg-[#f6eddb]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleEditStaffSubmit}
              className="space-y-3"
              noValidate
            >
              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium focus:border-[#735c00] focus:outline-hidden"
                />
                {editErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {editErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium focus:border-[#735c00] focus:outline-hidden"
                />
                {editErrors.email && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {editErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value="Staff"
                    disabled
                    className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-bold bg-[#f6eddb]/50 text-[#735c00] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1f1b11] mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#d1c6ab] rounded-xl text-xs font-medium bg-white focus:border-[#735c00] focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border border-[#d1c6ab] text-[#4d4632] font-semibold text-xs rounded-xl hover:bg-[#f6eddb]/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-bold text-xs rounded-xl shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1f1b11]">
                Delete Staff Member?
              </h3>
            </div>

            <p className="text-xs text-[#4d4632] leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-[#1f1b11]">{deletingStaff.name}</strong>{" "}
              from your QuoteCraft team? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 border border-[#d1c6ab] text-[#4d4632] font-semibold text-xs rounded-xl hover:bg-[#f6eddb]/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIVATE / DEACTIVATE MODAL */}
      {/* ========================================================= */}
      {statusTogglingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  statusTogglingStaff.status === "active"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {statusTogglingStaff.status === "active" ? (
                  <UserX className="w-5 h-5" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-base font-bold text-[#1f1b11]">
                {statusTogglingStaff.status === "active"
                  ? "Deactivate Staff Member?"
                  : "Activate Staff Member?"}
              </h3>
            </div>

            <p className="text-xs text-[#4d4632] leading-relaxed">
              {statusTogglingStaff.status === "active"
                ? `This user will no longer be able to sign in to QuoteCraft until their account is activated again.`
                : `This user will regain immediate access to sign in to QuoteCraft.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusTogglingStaff(null)}
                className="px-4 py-2 border border-[#d1c6ab] text-[#4d4632] font-semibold text-xs rounded-xl hover:bg-[#f6eddb]/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 font-bold text-xs rounded-xl shadow-2xs text-white ${
                  statusTogglingStaff.status === "active"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {statusTogglingStaff.status === "active"
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
