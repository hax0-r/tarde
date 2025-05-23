import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

// Referral data types
export interface ReferredUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface Referral {
  id: string;
  user: ReferredUser;
  tradeAmount: number;
  rewardAmount: number;
  isRewardClaimed: boolean;
  joinedAt: string;
}

export interface ReferralData {
  referralCode: string;
  referralCount: number;
  referralLink: string;
  eligibleForReward: boolean;
  totalReward: number;
  referrals: Referral[];
}

// Referral service functions
const referralService = {
  // Get user's referrals
  getReferrals: async (): Promise<ApiResponse<ReferralData>> => {
    try {
      console.log("Fetching referrals data from /users/referrals");
      const response = await apiClient.get<ApiResponse<ReferralData>>(
        "/users/referrals"
      );
      console.log("Referrals data response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching referrals:", error);
      throw error;
    }
  },

  // Claim referral reward (placeholder for future implementation)
  claimReward: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      "/users/referrals/claim"
    );
    return response.data;
  },
};

export default referralService;
