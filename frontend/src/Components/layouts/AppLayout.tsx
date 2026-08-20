import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "../ui/ToastContainer";

import { useAuth } from "../../Context/AuthContext";

export const AppLayout: React.FC = () => {
  const {
    user,
    logout,
    isAuthenticated,
    loading,
  } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="md:pl-65 flex-1 flex flex-col min-w-0">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-325 w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};