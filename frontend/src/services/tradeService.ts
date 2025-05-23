import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

// Trade types
export interface TradeRequest {
  amount: number;
  duration: number; // Duration in minutes
  isBot?: boolean;
}

export interface CompleteTradeRequest {
  tradeId: string;
  profit: number;
  profitPercentage: number;
}

export interface Trade {
  id?: string;
  _id?: string;
  tradeId?: string;
  amount: number;
  profit: number;
  profitPercentage: number;
  status: "active" | "completed" | "failed";
  startTime: string;
  endTime: string;
  createdAt: string;
}

// Trade service functions
const tradeService = {
  // Start a new trade
  startTrade: async (data: TradeRequest): Promise<ApiResponse<Trade>> => {
    const response = await apiClient.post<ApiResponse<Trade>>(
      "/trades/start",
      data
    );
    return response.data;
  },

  // Complete a trade (manual completion for demo)
  completeTrade: async (
    data: CompleteTradeRequest
  ): Promise<ApiResponse<Trade>> => {
    try {
      const response = await apiClient.post<ApiResponse<Trade>>(
        `/trades/${data.tradeId}/complete`,
        {
          profit: data.profit,
          profitPercentage: data.profitPercentage,
        }
      );
      console.log("Complete trade API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in completeTrade API call:", error);
      throw error;
    }
  },

  // Get active trades
  getActiveTrades: async (): Promise<ApiResponse<Trade[]>> => {
    const response = await apiClient.get<ApiResponse<Trade[]>>(
      "/trades/active"
    );
    return response.data;
  },

  // Get trade history
  getTradeHistory: async (): Promise<ApiResponse<Trade[]>> => {
    const response = await apiClient.get<ApiResponse<Trade[]>>(
      "/trades/history"
    );
    return response.data;
  },
};

export default tradeService;
