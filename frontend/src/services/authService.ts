import apiClient from "./api";
import { ApiResponse, AuthTokenData, UserProfileData } from "./errorTypes";

// Types
export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyResetTokenData {
  email: string;
  token: string;
}

export interface ResetPasswordWithTokenData {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileImageData {
  profileImageUrl: string;
}

export interface UpdateProfileData {
  fullName: string;
}

// Auth service functions
const authService = {
  // Register a new user
  register: async (data: RegisterData): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>("/auth/register", data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (
    data: VerifyOTPData
  ): Promise<ApiResponse<AuthTokenData>> => {
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      "/auth/verify-otp",
      data
    );
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<ApiResponse<AuthTokenData>> => {
    const response = await apiClient.post<ApiResponse<AuthTokenData>>(
      "/auth/login",
      data
    );
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (
    data: VerifyResetTokenData
  ): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      "/auth/verify-reset-token",
      data
    );
    return response.data;
  },

  // Reset password with token
  resetPasswordWithToken: async (
    data: ResetPasswordWithTokenData
  ): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      "/auth/reset-password-with-token",
      data
    );
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<ApiResponse<UserProfileData>> => {
    const response = await apiClient.get<ApiResponse<UserProfileData>>(
      "/auth/profile"
    );
    return response.data;
  },

  // Update profile image
  updateProfileImage: async (
    data: UpdateProfileImageData
  ): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      "/users/profile/image",
      data
    );
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>("/users/profile", data);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tradingProfit");
  },
};

export default authService;
