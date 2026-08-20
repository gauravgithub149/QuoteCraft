import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "../Type";
import { authService } from "../Services/auth.service";
import Api from "../Services/Api";
interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  address?: string;
  taxId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("qc_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("qc_token");
  });

  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  //---------------------------------------
  // Login
  //---------------------------------------

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.login({
        email,
        password,
      });

      setToken(response.data.accessToken);
      setUser(response.data.user);

      localStorage.setItem("qc_token", response.data.accessToken);
      localStorage.setItem("qc_user", JSON.stringify(response.data.user));

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Login error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Invalid email or password.",
      };
    }
  };

  //---------------------------------------
  // Register
  //---------------------------------------

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await authService.register(data);

      setToken(response.data.accessToken);
      setUser(response.data.user);

      localStorage.setItem("qc_token", response.data.accessToken);
      localStorage.setItem("qc_user", JSON.stringify(response.data.user));

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  //---------------------------------------
  // Logout
  //---------------------------------------

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("qc_user");
    localStorage.removeItem("qc_token");
  };

  //---------------------------------------
  // Verify Logged In User
  //---------------------------------------

  const updateProfile = async (
    updated: Partial<UserProfile>,
  ): Promise<void> => {
    if (!token) {
      throw new Error("Authentication token missing.");
    }

    try {
      const response = await Api.put<{
        success: boolean;
        message: string;
        data: UserProfile;
      }>("/auth/profile", {
        name: updated.name,
        email: updated.email,
        companyName: updated.companyName,
        address: updated.address,
        taxId: updated.taxId,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update profile.");
      }

      const updatedUser = response.data.data;

      setUser(updatedUser);

      localStorage.setItem("qc_user", JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error("Update profile error:", error);

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile.",
      );
    }
  };
  const refreshUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const user = await authService.getProfile();

      setUser(user);

      localStorage.setItem("qc_user", JSON.stringify(user));
    } catch (error) {
      console.error(error);

      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, token, loading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
