import { useEffect, useState } from "react";
import { GlobalLoader } from "./Components/common/GlobalLoader";
import { subscribeToLoading } from "./Utils/loadingManager";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./Components/layouts/AppLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Register } from "./pages/Register";
import { AuthProvider } from "./Context/AuthContext";
import { CustomersList } from "./pages/CustomersList";
import { CustomerDetail } from "./pages/CustomerDetail";
import { ProductsList } from "./pages/ProductsList";
import { AddProduct } from "./pages/AddProduct";
import { CreateQuotation } from "./pages/CreateQuotation";
import { QuotationDetail } from "./pages/QuotationDetail";
import { QuotationsList } from "./pages/QuotationsList";
import { Settings } from "./pages/Settings";
import { UserManagement } from "./pages/UserManagement";
import { ScrollToTop } from "./Components/common/ScrollToTop";

function GlobalLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return subscribeToLoading(setIsLoading);
  }, []);

  if (!isLoading) {
    return null;
  }

  return <GlobalLoader />;
}

export default function App() {
  return (
    <AuthProvider>

      <GlobalLoadingOverlay />
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* PROTECTED ROUTES */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<AddProduct />} />

            <Route path="/quotations" element={<QuotationsList />} />
            <Route path="/quotations/new" element={<CreateQuotation />} />
            <Route path="/quotations/:id" element={<QuotationDetail />} />
            <Route path="/quotations/edit/:id" element={<CreateQuotation />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
