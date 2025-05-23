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
} from "../../../services/transactionService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import { FaCheck, FaTimes, FaImage, FaCopy } from "react-icons/fa";

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

const DepositManage = () => {
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
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Only fetch deposit transactions
      const status =
        statusFilter !== "all"
          ? (statusFilter as TransactionStatus)
          : undefined;
      const response = await transactionService.getTransactions(
        TransactionType.DEPOSIT,
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
          `Deposit ${
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
        toast.error(response.message || `Failed to ${actionType} deposit`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing deposit:`, error);
      toast.error(`Failed to ${actionType} deposit. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const openDialog = (transaction: Transaction, type: "approve" | "reject") => {
    setSelectedTransaction(transaction);
    setActionType(type);
    setAdminNote("");

    // If there's a transaction reference that looks like a URL, set it as preview
    if (
      transaction.transactionReference &&
      isValidImageUrl(transaction.transactionReference)
    ) {
      setPreviewImageUrl(transaction.transactionReference);
    } else {
      setPreviewImageUrl(null);
    }

    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedTransaction(null);
    setActionType(null);
    setAdminNote("");
    setPreviewImageUrl(null);
  };

  const isValidImageUrl = (url: string) => {
    return (
      url.match(/\.(jpeg|jpg|gif|png)$/i) !== null || url.includes("cloudinary")
    );
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

  return (
    <div className="bg-[#171022] w-full min-h-screen p-5">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Manage Deposit Requests
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
                <SelectItem value="all">All Deposits</SelectItem>
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
                    "Amount",
                    "Date",
                    "Status",
                    "Payment Proof",
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
                    <td colSpan={6} className="p-5 text-center text-white">
                      Loading deposits...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-5 text-center text-white">
                      No deposit transactions found
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
                          {transaction.transactionReference ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (transaction.transactionReference) {
                                  setPreviewImageUrl(
                                    transaction.transactionReference
                                  );
                                  setSelectedTransaction(transaction);
                                  setActionType(null);
                                  setIsDialogOpen(true);
                                }
                              }}
                              className="flex items-center gap-1 text-black"
                            >
                              <FaImage size={14} />
                              View Proof
                            </Button>
                          ) : (
                            <span className="text-gray-400">No proof</span>
                          )}
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

      {/* Dialog for Approving/Rejecting with image preview */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#2a1c40] text-white border-[#ffffff30]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {actionType === "approve"
                ? "Approve Deposit"
                : actionType === "reject"
                ? "Reject Deposit"
                : "View Payment Proof"}
            </DialogTitle>
            <DialogDescription className="text-[#ffffffb0]">
              {actionType
                ? `Are you sure you want to ${
                    actionType === "approve" ? "approve" : "reject"
                  } this deposit of PKR ${
                    selectedTransaction?.amount.toLocaleString() || "0"
                  }?`
                : "Payment proof submitted by the user"}
            </DialogDescription>
          </DialogHeader>

          {previewImageUrl && (
            <div className="mt-2">
              <p className="mb-2 text-sm font-medium">Payment Proof:</p>
              <div className="w-full h-[300px] bg-black rounded-md overflow-hidden">
                <img
                  src={previewImageUrl}
                  alt="Payment proof"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {actionType && (
            <div className="mt-4">
              <label className="text-sm font-medium">
                Add Note (Optional):
              </label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this decision"
                className="mt-1 bg-[#ffffff15] placeholder:text-[#ffffff60] border-[#ffffff30]"
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="border-[#ffffff30] text-black"
            >
              {actionType ? "Cancel" : "Close"}
            </Button>

            {actionType && (
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
                  ? "Approve Deposit"
                  : "Reject Deposit"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepositManage;
