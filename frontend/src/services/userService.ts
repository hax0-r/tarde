import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  profileImage?: string;
  balance: number;
  totalProfit: number;
  referralCode: string;
  referralCount: number;
  createdAt: string;
}

export interface UserDetail extends User {
  referrals?: Array<{
    id: string;
    user: {
      fullName: string;
      email: string;
    };
    joinedAt: string;
  }>;
  transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  paymentMethods?: Array<{
    id: string;
    type: string;
    name: string;
    isDefault: boolean;
  }>;
}

const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>("/users/all");
    return response.data;
  },

  // Get single user details (admin only)
  getUserDetails: async (userId: string): Promise<ApiResponse<UserDetail>> => {
    const response = await apiClient.get<ApiResponse<UserDetail>>(
      `/users/${userId}`
    );
    return response.data;
  },

  // Delete a user (admin only)
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/users/${userId}`);
    return response.data;
  },
};

export default userService;
