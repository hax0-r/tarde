import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

// Payment method types
export enum PaymentMethodType {
  BANK = "bank",
  EASYPAISA = "easypaisa",
  JAZZCASH = "jazzcash",
}

// Payment method data types
export interface PaymentMethodData {
  id: string;
  type: PaymentMethodType;
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
  isDefault: boolean;
}

export interface AddPaymentMethodData {
  type: PaymentMethodType;
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
}

export interface UpdatePaymentMethodData {
  accountTitle?: string;
  bankName?: string;
}

// Payment service functions
const paymentService = {
  // Get all payment methods
  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethodData[]>> => {
    const response = await apiClient.get<ApiResponse<PaymentMethodData[]>>(
      "/payments"
    );
    return response.data;
  },

  // Add a new payment method
  addPaymentMethod: async (
    data: AddPaymentMethodData
  ): Promise<ApiResponse<PaymentMethodData>> => {
    const response = await apiClient.post<ApiResponse<PaymentMethodData>>(
      "/payments",
      data
    );
    return response.data;
  },

  // Update a payment method
  updatePaymentMethod: async (
    methodId: string,
    data: UpdatePaymentMethodData
  ): Promise<ApiResponse<PaymentMethodData>> => {
    const response = await apiClient.put<ApiResponse<PaymentMethodData>>(
      `/payments/${methodId}`,
      data
    );
    return response.data;
  },

  // Set a payment method as default
  setDefaultPaymentMethod: async (methodId: string): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(
      `/payments/${methodId}/default`
    );
    return response.data;
  },

  // Delete a payment method
  deletePaymentMethod: async (methodId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      `/payments/${methodId}`
    );
    return response.data;
  },
};

export default paymentService;
