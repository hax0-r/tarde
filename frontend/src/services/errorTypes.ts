// Common error response type from the API
export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

// Success response types from the API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Auth response data types
export interface AuthTokenData {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    isAdmin?: boolean;
  };
}

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  balance: number;
  totalProfit: number;
  referralCode: string;
  referralCount: number;
  isAdmin?: boolean;
}
