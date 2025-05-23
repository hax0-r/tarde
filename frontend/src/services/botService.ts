import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

// Bot types
export enum BotType {
  BASIC = "basic",
  ADVANCED = "advanced",
  PRO = "pro",
}

// Bot subscription status
export enum BotSubscriptionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

// Bot plan interface
export interface BotPlan {
  id: string;
  name: string;
  profitPercentage: number;
  duration: string;
  price: number;
  description: string;
}

// Bot subscription interface
export interface BotSubscription {
  id: string;
  botType: BotType;
  profitPercentage: number;
  status: BotSubscriptionStatus;
  isActive: boolean;
  startDate: string;
  endDate: string;
  paymentProofUrl?: string;
  adminNote?: string;
  createdAt: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
}

// Bot subscription request interface
export interface BotSubscriptionRequest {
  planId: string;
  paymentProofUrl: string;
}

// Request response interface
export interface BotSubscriptionResponse {
  requestId: string;
}

// Active subscription response
export interface ActiveBotSubscriptionResponse {
  isActive: boolean;
  isPending?: boolean;
  id?: string;
  botType?: BotType;
  profitPercentage?: number;
  startDate?: string;
  endDate?: string;
  remainingDays?: number;
  requestedAt?: string;
}

// Bot service functions
const botService = {
  // Get all bot plans
  getBotPlans: async (): Promise<ApiResponse<BotPlan[]>> => {
    const response = await apiClient.get<ApiResponse<BotPlan[]>>("/bots/plans");
    return response.data;
  },

  // Get active bot subscription
  getActiveBotSubscription: async (): Promise<
    ApiResponse<ActiveBotSubscriptionResponse>
  > => {
    const response = await apiClient.get<
      ApiResponse<ActiveBotSubscriptionResponse>
    >("/bots/subscription");
    return response.data;
  },

  // Request a bot subscription with payment proof
  requestBotSubscription: async (
    data: BotSubscriptionRequest
  ): Promise<ApiResponse<BotSubscriptionResponse>> => {
    const response = await apiClient.post<ApiResponse<BotSubscriptionResponse>>(
      "/bots/request-subscription",
      data
    );
    return response.data;
  },

  // Cancel active bot subscription
  cancelBotSubscription: async (): Promise<
    ApiResponse<{ message: string }>
  > => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/bots/cancel-subscription"
    );
    return response.data;
  },

  // Admin: Get all bot subscription requests
  getAllSubscriptions: async (
    status?: BotSubscriptionStatus
  ): Promise<ApiResponse<BotSubscription[]>> => {
    let url = "/bots/admin/subscriptions";
    if (status) {
      url += `?status=${status}`;
    }
    const response = await apiClient.get<ApiResponse<BotSubscription[]>>(url);
    return response.data;
  },

  // Admin: Approve or reject a subscription
  approveRejectSubscription: async (
    subscriptionId: string,
    action: "approve" | "reject",
    adminNote?: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(
      `/bots/admin/subscriptions/${subscriptionId}`,
      { action, adminNote }
    );
    return response.data;
  },
};

export default botService;
