import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, Plus, LogOut} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const { user, logout } = useAuth();
  const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";
  if (!user) {
    return null;
  }
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-[#fff8f0]/90 backdrop-blur-md border-b border-[#d1c6ab]/60 px-4 md:px-8 flex items-center justify-between no-print">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden text-[#4d4632] p-2 hover:bg-[#f6eddb] rounded-lg transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4632]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog, quotes, clients..."
            className="w-full pl-9 pr-4 py-1.5 border border-[#d1c6ab] rounded-full text-xs bg-white/90 text-[#1f1b11] placeholder-[#4d4632]/70 focus:outline-none focus:border-[#735c00] focus:ring-1 focus:ring-[#facc15] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative text-[#4d4632] hover:text-[#1f1b11] p-2 rounded-full hover:bg-[#f6eddb] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#facc15] ring-2 ring-white" />
        </button>

        {/* Create Quote Button */}
        <button
          onClick={() => navigate("/quotations/new")}
          className="bg-[#facc15] hover:bg-[#facc15]/90 text-[#1f1b11] font-semibold text-xs px-4 py-2 rounded-lg shadow-2xs hover:shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Quote</span>
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-[#f6eddb] transition-colors"
          title="Account Settings"
        >
          <img
            src={user?.avatarUrl || DEFAULT_AVATAR}
            alt={user?.name || "User"}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
            className="w-8 h-8 rounded-full border border-[#d1c6ab] object-cover"
          />
        </button>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="px-3 py-1.5 border border-[#d1c6ab] hover:border-red-300 bg-white hover:bg-red-50 text-red-700 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
          title="Log Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
