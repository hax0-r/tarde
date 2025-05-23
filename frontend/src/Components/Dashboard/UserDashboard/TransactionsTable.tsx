import { useEffect, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { format } from "date-fns";
import transactionService, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../../services/transactionService";
import { toast } from "react-toastify";
import { PaymentMethodType } from "../../../services/paymentService";

interface TransactionsTableProps {
  limit?: number;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  limit = 10,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await transactionService.getTransactions(
        undefined,
        undefined,
        currentPage,
        limit
      );

      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.pages);
      } else {
        toast.error(response.message || "Failed to load transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        };
      case TransactionStatus.PENDING:
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
        };
      case TransactionStatus.FAILED:
        return {
          color: "text-red-600",
          bg: "bg-red-50",
        };
      default:
        return {
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
    }
  };

  const getMethodName = (type: PaymentMethodType | string) => {
    if (type === "manual") {
      return "Manual Transfer";
    }

    switch (type) {
      case PaymentMethodType.JAZZCASH:
        return "JazzCash";
      case PaymentMethodType.EASYPAISA:
        return "EasyPaisa";
      case PaymentMethodType.BANK:
        return "Bank Account";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-[#ffffff80]">Loading transactions...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-[#ffffff80]">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto py-4 max-h-[55vh] custom-scrollbar">
      <div className="block">
        <div className="overflow-x-auto w-full border rounded-lg border-[#ffffff80]">
          <table className="w-full rounded-xl">
            <thead>
              <tr className="bg-[#372359] text-nowrap">
                {[
                  "Transaction ID",
                  "Payment Method",
                  "Date",
                  "Status",
                  "Amount",
                  "Type",
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="p-5 text-left font-medium text-white capitalize"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y text-nowrap divide-[#ffffff5d]">
              {transactions.map((transaction) => {
                const statusStyle = getStatusColor(transaction.status);

                return (
                  <tr
                    key={transaction.id}
                    className="transition-all duration-500 hover:bg-[#ffffff10]"
                  >
                    <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                      {getMethodName(transaction.paymentMethod.type)}
                    </td>
                    <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="p-5 text-sm font-medium opacity-90">
                      <div
                        className={`py-1.5 px-1.5 ${statusStyle.color} ${statusStyle.bg} rounded-full flex justify-center w-24 items-center gap-1`}
                      >
                        <GoDotFill />
                        <span className="font-medium text-xs">
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                      PKR {transaction.amount.toLocaleString()}
                    </td>
                    <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                      {transaction.type === TransactionType.DEPOSIT
                        ? "Deposit"
                        : "Withdrawal"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-[#ffffff20] text-[#ffffff50] cursor-not-allowed"
                  : "bg-[#5f29b7] text-white cursor-pointer hover:bg-[#4e228f]"
              }`}
            >
              Previous
            </button>
            <span className="text-[#ffffffb0]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-[#ffffff20] text-[#ffffff50] cursor-not-allowed"
                  : "bg-[#5f29b7] text-white cursor-pointer hover:bg-[#4e228f]"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
