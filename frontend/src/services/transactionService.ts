import apiClient from "./api";
import { ApiResponse } from "./errorTypes";
import { PaymentMethodType } from "./paymentService";

// Transaction types
export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
}

// Transaction status
export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Payment method interface
export interface PaymentMethod {
  _id: string;
  userId: string;
  type: PaymentMethodType;
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction data types
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: {
    id: string;
    type: PaymentMethodType;
    accountNumber: string;
    accountTitle: string;
    bankName?: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  transactionReference?: string;
  description: string;
  createdAt: string;
}

export interface TransactionDetails extends Transaction {
  updatedAt: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateDepositData {
  amount: number;
  paymentMethodId: string;
  transactionReference?: string;
}

export interface CreateWithdrawalData {
  amount: number;
  paymentMethodId: string;
}

export interface UpdateTransactionStatusData {
  status: TransactionStatus;
  adminNote?: string;
}

// Transaction service functions
const transactionService = {
  // Get all transactions
  getTransactions: async (
    type?: TransactionType,
    status?: TransactionStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<TransactionListResponse>> => {
    let url = `/transactions?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    if (status) {
      url += `&status=${status}`;
    }

    const response = await apiClient.get<ApiResponse<TransactionListResponse>>(
      url
    );
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (
    transactionId: string
  ): Promise<ApiResponse<TransactionDetails>> => {
    const response = await apiClient.get<ApiResponse<TransactionDetails>>(
      `/transactions/${transactionId}`
    );
    return response.data;
  },

  // Create a deposit
  createDeposit: async (
    data: CreateDepositData
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      "/transactions/deposit",
      data
    );
    return response.data;
  },

  // Create a withdrawal
  createWithdrawal: async (
    data: CreateWithdrawalData
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      "/transactions/withdrawal",
      data
    );
    return response.data;
  },

  // Update transaction status (admin only)
  updateTransactionStatus: async (
    transactionId: string,
    data: UpdateTransactionStatusData
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.put<ApiResponse<Transaction>>(
      `/transactions/${transactionId}/status`,
      data
    );
    return response.data;
  },

  // Get user payment methods
  getUserPaymentMethods: async (
    userId: string
  ): Promise<ApiResponse<PaymentMethod[]>> => {
    const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(
      `/users/${userId}/payment-methods`
    );
    return response.data;
  },
};

export default transactionService;
