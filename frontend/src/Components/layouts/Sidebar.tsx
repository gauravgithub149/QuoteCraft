import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";
  if (!user) {
    return null;
  }
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quotations",
    path: "/quotations",
    icon: FileText,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    label: "User Management",
    path: "/users",
    icon: Users,
  },
  {
    label: "Products & Services",
    path: "/products",
    icon: Package,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

  const content = (
    <aside className="h-full w-65 bg-[#fff8f0] text-[#1f1b11] flex flex-col border-r border-[#d1c6ab]/60 select-none no-print">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#d1c6ab]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#facc15] flex items-center justify-center text-[#1f1b11] shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight tracking-tight text-[#1f1b11]">
              QuoteCraft
            </h1>
            <span className="text-xs text-[#4d4632] font-medium">
              {user.plan || "Enterprise Plan"}
            </span>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-[#4d4632] hover:text-[#1f1b11] p-1 rounded-md hover:bg-[#f6eddb]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#f0e7d6] text-[#1f1b11] font-semibold border-l-2 border-[#735c00] shadow-2xs"
                  : "text-[#4d4632] hover:bg-[#fcf3e1] hover:text-[#1f1b11]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-[#735c00]" : "text-[#4d4632]"}`}
                />
                <span>{item.label}</span>
              </div>
              {/* {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-[#facc15] text-[#6c5700]">
                  {item.badge}
                </span>
              )} */}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Mini Profile */}
      <div className="p-4 border-t border-[#d1c6ab]/60 bg-[#f6eddb]/40 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={user?.avatarUrl || DEFAULT_AVATAR}
            alt={user?.name || "User"}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
            className="w-9 h-9 rounded-full object-cover border border-[#d1c6ab] shrink-0"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-[#1f1b11] truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-[#4d4632] truncate">
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="p-1.5 text-[#4d4632] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          title="Sign Out / Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 z-30">
        {content}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-65 max-w-full h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
