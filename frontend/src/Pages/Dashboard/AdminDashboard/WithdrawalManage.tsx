import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { Button } from "../../../Components/ui/button";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import transactionService, {
  Transaction,
  TransactionStatus,
  TransactionType,
  PaymentMethod,
} from "../../../services/transactionService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import { FaCheck, FaTimes, FaCopy, FaEye } from "react-icons/fa";

// Simple textarea component since it's missing
const Textarea = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 rounded-md ${className}`}
  />
);

const WithdrawalManage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>(
    []
  );
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<Transaction["user"] | null>(
    null
  );

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Only fetch withdrawal transactions
      const status =
        statusFilter !== "all"
          ? (statusFilter as TransactionStatus)
          : undefined;
      const response = await transactionService.getTransactions(
        TransactionType.WITHDRAWAL,
        status,
        page,
        10
      );

      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.pages);
      } else {
        toast.error(response.message || "Failed to load transactions");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransaction || !actionType) return;

    try {
      setProcessingId(selectedTransaction.id);

      const newStatus =
        actionType === "approve"
          ? TransactionStatus.COMPLETED
          : TransactionStatus.FAILED;

      const response = await transactionService.updateTransactionStatus(
        selectedTransaction.id,
        {
          status: newStatus,
          adminNote: adminNote.trim() || undefined,
        }
      );

      if (response.success) {
        toast.success(
          `Withdrawal ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`
        );

        // Update the transaction in the list
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === selectedTransaction.id
              ? { ...transaction, status: newStatus }
              : transaction
          )
        );

        closeDialog();
      } else {
        toast.error(response.message || `Failed to ${actionType} withdrawal`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing withdrawal:`, error);
      toast.error(`Failed to ${actionType} withdrawal. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const openDialog = (transaction: Transaction, type: "approve" | "reject") => {
    setSelectedTransaction(transaction);
    setActionType(type);
    setAdminNote("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedTransaction(null);
    setActionType(null);
    setAdminNote("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const formatStatus = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return {
          label: "Pending",
          className: "bg-yellow-50 text-yellow-600",
        };
      case TransactionStatus.COMPLETED:
        return {
          label: "Approved",
          className: "bg-green-50 text-green-600",
        };
      case TransactionStatus.FAILED:
        return {
          label: "Rejected",
          className: "bg-red-50 text-red-600",
        };
      default:
        return {
          label: status,
          className: "bg-gray-50 text-gray-600",
        };
    }
  };

  // Add a function to handle payment method display
  const getPaymentMethodDisplay = (
    paymentMethod: Transaction["paymentMethod"]
  ) => {
    if (!paymentMethod || paymentMethod.id === "manual") {
      return "Manual Withdrawal";
    }

    return (
      <div className="flex flex-col">
        <span>{paymentMethod.type}</span>
        <span className="text-xs font-medium">
          {paymentMethod.accountNumber}
        </span>
        {paymentMethod.accountTitle && (
          <span className="text-xs text-gray-400">
            Account: {paymentMethod.accountTitle}
          </span>
        )}
        {paymentMethod.bankName && (
          <span className="text-xs text-gray-400">
            Bank: {paymentMethod.bankName}
          </span>
        )}
      </div>
    );
  };

  const fetchUserPaymentMethods = async (userId: string) => {
    try {
      setLoadingPaymentMethods(true);
      const response = await transactionService.getUserPaymentMethods(userId);

      if (response.success && response.data) {
        setUserPaymentMethods(response.data);
      } else {
        toast.error(response.message || "Failed to load payment methods");
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast.error("Failed to load payment methods. Please try again.");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const openPaymentMethodsDialog = async (user: Transaction["user"]) => {
    if (!user) return;

    setSelectedUser(user);
    setIsPaymentMethodDialogOpen(true);
    await fetchUserPaymentMethods(user.id);
  };

  return (
    <div className="bg-[#171022] w-full min-h-screen p-5">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Manage Withdrawal Requests
      </h2>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="border rounded-lg flex items-center border-[#ffffff80] pr-2 justify-center w-full md:w-auto">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search by ID or amount"
            className="w-full placeholder:text-xs text-white bg-transparent p-2"
          />
          <IoIosSearch className="text-[#ffffffc4] text-2xl" />
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => setStatusFilter(value)}
            defaultValue="all"
          >
            <SelectTrigger className="w-[180px] text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Withdrawals</SelectItem>
                <SelectItem value={TransactionStatus.PENDING}>
                  Pending
                </SelectItem>
                <SelectItem value={TransactionStatus.COMPLETED}>
                  Approved
                </SelectItem>
                <SelectItem value={TransactionStatus.FAILED}>
                  Rejected
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 max-h-[75vh] custom-scrollbar">
        <div className="block">
          <div className="overflow-x-auto w-full border rounded-lg border-[#ffffff80]">
            <table className="w-full rounded-xl">
              <thead>
                <tr className="bg-[#372359] text-nowrap">
                  {[
                    "ID",
                    "User",
                    "Amount",
                    "Date",
                    "Status",
                    "Payment Method",
                    "Actions",
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-5 text-center text-white">
                      Loading withdrawals...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5 text-center text-white">
                      No withdrawal transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const { label, className } = formatStatus(
                      transaction.status
                    );

                    return (
                      <tr
                        key={transaction.id}
                        className="transition-all duration-500 hover:bg-[#ffffff10]"
                      >
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          <div className="flex items-center gap-1">
                            {transaction.id.substring(0, 8)}
                            <button
                              onClick={() => copyToClipboard(transaction.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              <FaCopy size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {transaction.user ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span>{transaction.user.fullName}</span>
                                <button
                                  onClick={() =>
                                    openPaymentMethodsDialog(transaction.user)
                                  }
                                  className="text-gray-400 hover:text-white"
                                  title="View all payment methods"
                                >
                                  <FaEye size={14} />
                                </button>
                              </div>
                              <span className="text-xs text-gray-400">
                                {transaction.user.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              User not found
                            </span>
                          )}
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          PKR {transaction.amount.toLocaleString()}
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="p-5 text-sm font-medium opacity-90">
                          <div
                            className={`py-1.5 px-3 ${className} rounded-full flex justify-center w-24 items-center`}
                          >
                            <span className="font-medium text-xs">{label}</span>
                          </div>
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {getPaymentMethodDisplay(transaction.paymentMethod)}
                        </td>
                        <td className="p-5 flex items-center gap-2 text-sm font-medium text-[#fff] opacity-80">
                          {transaction.status === TransactionStatus.PENDING && (
                            <>
                              <Button
                                onClick={() =>
                                  openDialog(transaction, "approve")
                                }
                                disabled={processingId === transaction.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-white"
                              >
                                <FaCheck size={12} />
                                Approve
                              </Button>
                              <Button
                                onClick={() =>
                                  openDialog(transaction, "reject")
                                }
                                disabled={processingId === transaction.id}
                                size="sm"
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <FaTimes size={12} />
                                Reject
                              </Button>
                            </>
                          )}
                          {transaction.status !== TransactionStatus.PENDING && (
                            <span className="text-gray-400">
                              {transaction.status ===
                              TransactionStatus.COMPLETED
                                ? "Approved"
                                : "Rejected"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-5 gap-2">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <div className="px-4 py-2 rounded-md bg-[#ffffff20] text-white">
            Page {page} of {totalPages}
          </div>
          <Button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || loading}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Dialog for Approving/Rejecting */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#2a1c40] text-white border-[#ffffff30]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {actionType === "approve"
                ? "Approve Withdrawal"
                : "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription className="text-[#ffffffb0]">
              {`Are you sure you want to ${
                actionType === "approve" ? "approve" : "reject"
              } this withdrawal of PKR ${
                selectedTransaction?.amount.toLocaleString() || "0"
              }?`}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="mt-2">
              <p className="mb-2 text-sm font-medium">Withdrawal Details:</p>
              <div className="bg-[#ffffff15] p-3 rounded-md space-y-2">
                <p>
                  <span className="text-[#ffffffa0]">Amount:</span> PKR{" "}
                  {selectedTransaction.amount.toLocaleString()}
                </p>

                {selectedTransaction.user && (
                  <>
                    <p>
                      <span className="text-[#ffffffa0]">User:</span>{" "}
                      {selectedTransaction.user.fullName}
                    </p>
                    <p>
                      <span className="text-[#ffffffa0]">Email:</span>{" "}
                      {selectedTransaction.user.email}
                    </p>
                  </>
                )}

                <p>
                  <span className="text-[#ffffffa0]">Payment Method:</span>{" "}
                  {selectedTransaction.paymentMethod.type}
                </p>
                <p>
                  <span className="text-[#ffffffa0]">Account Number:</span>{" "}
                  {selectedTransaction.paymentMethod.accountNumber}
                </p>

                {selectedTransaction.paymentMethod.accountTitle && (
                  <p>
                    <span className="text-[#ffffffa0]">Account Title:</span>{" "}
                    {selectedTransaction.paymentMethod.accountTitle}
                  </p>
                )}

                {selectedTransaction.paymentMethod.bankName && (
                  <p>
                    <span className="text-[#ffffffa0]">Bank:</span>{" "}
                    {selectedTransaction.paymentMethod.bankName}
                  </p>
                )}

                <p>
                  <span className="text-[#ffffffa0]">Date:</span>{" "}
                  {formatDate(selectedTransaction.createdAt)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm font-medium">Add Note (Optional):</label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note about this decision"
              className="mt-1 bg-[#ffffff15] placeholder:text-[#ffffff60] border-[#ffffff30]"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="border-[#ffffff30] text-black"
            >
              Cancel
            </Button>

            <Button
              onClick={handleStatusUpdate}
              disabled={processingId === selectedTransaction?.id}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processingId === selectedTransaction?.id
                ? "Processing..."
                : actionType === "approve"
                ? "Approve Withdrawal"
                : "Reject Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for viewing user payment methods */}
      <Dialog
        open={isPaymentMethodDialogOpen}
        onOpenChange={setIsPaymentMethodDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] bg-[#2a1c40] text-white border-[#ffffff30]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Payment Methods for {selectedUser?.fullName}
            </DialogTitle>
            <DialogDescription className="text-[#ffffffb0]">
              All payment methods registered by this user
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {loadingPaymentMethods ? (
              <p className="text-center p-4">Loading payment methods...</p>
            ) : userPaymentMethods.length === 0 ? (
              <p className="text-center p-4">
                No payment methods found for this user
              </p>
            ) : (
              <div className="space-y-3">
                {userPaymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="bg-[#ffffff15] p-3 rounded-md"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {method.type.slice(0, 1).toUpperCase() +
                          method.type.slice(1)}
                      </h4>
                      <span className="text-xs bg-[#ffffff20] px-2 py-1 rounded">
                        {new Date(method.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="text-[#ffffffa0]">
                          Account Number:
                        </span>{" "}
                        {method.accountNumber}
                        <button
                          onClick={() => copyToClipboard(method.accountNumber)}
                          className="ml-2 text-gray-400 hover:text-white inline-flex items-center"
                          title="Copy account number"
                        >
                          <FaCopy size={12} />
                        </button>
                      </p>
                      <p className="text-sm">
                        <span className="text-[#ffffffa0]">Account Title:</span>{" "}
                        {method.accountTitle}
                        <button
                          onClick={() => copyToClipboard(method.accountTitle)}
                          className="ml-2 text-gray-400 hover:text-white inline-flex items-center"
                          title="Copy account title"
                        >
                          <FaCopy size={12} />
                        </button>
                      </p>
                      {method.bankName && (
                        <p className="text-sm">
                          <span className="text-[#ffffffa0]">Bank:</span>{" "}
                          {method.bankName}
                          <button
                            onClick={() =>
                              method.bankName &&
                              copyToClipboard(method.bankName)
                            }
                            className="ml-2 text-gray-400 hover:text-white inline-flex items-center"
                            title="Copy bank name"
                          >
                            <FaCopy size={12} />
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={() => setIsPaymentMethodDialogOpen(false)}
              className="bg-[#372359] hover:bg-[#4b2e78]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalManage;
