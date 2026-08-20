import type { UserProfile } from "../Type";
import Api from "./Api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
  };
}
const normalizeUser = (user: any): UserProfile => {
  return {
    ...user,
    id: user.id || user._id,
  };
};
class AuthService {
  // ==========================
  // Login
  // ==========================
  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await Api.post<AuthResponse>("/auth/login", data);

    response.data.data.user = normalizeUser(response.data.data.user);

    return response.data;
  }

  // ==========================
  // Register
  // ==========================
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await Api.post<AuthResponse>("/auth/register", data);

    response.data.data.user = normalizeUser(response.data.data.user);

    return response.data;
  }

  // ==========================
  // Get Logged In User
  // ==========================
  async getProfile(): Promise<UserProfile> {
    const response = await Api.get("/auth/me");

    const user = response.data.data;

    return normalizeUser(user);
  }

  // ==========================
  // Update Profile
  // ==========================
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await Api.put<{
      success: boolean;
      user: UserProfile;
    }>("/auth/profile", data);

    return response.data.user;
  }

  // ==========================
  // Forgot Password
  // ==========================
  async forgotPassword(email: string) {
    const response = await Api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  }

  // ==========================
  // Reset Password
  // ==========================
  async resetPassword(token: string, password: string) {
    const response = await Api.post("/auth/reset-password", {
      token,
      password,
    });

    return response.data;
  }

  // ==========================
  // Logout
  // ==========================
  logout() {
    localStorage.removeItem("qc_token");
    localStorage.removeItem("qc_user");
  }
}

export const authService = new AuthService();
