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
import botService, {
  BotSubscription,
  BotSubscriptionStatus,
  BotType,
} from "../../../services/botService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import { FaCheck, FaTimes, FaImage } from "react-icons/fa";

// Simple textarea component
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

const BotSubscriptionManage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    BotSubscriptionStatus | "all"
  >(BotSubscriptionStatus.PENDING);
  const [subscriptions, setSubscriptions] = useState<BotSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<BotSubscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );

  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const status = statusFilter !== "all" ? statusFilter : undefined;
      const response = await botService.getAllSubscriptions(status);

      if (response.success && response.data) {
        setSubscriptions(response.data);
      } else {
        toast.error(response.message || "Failed to load subscription requests");
      }
    } catch (error) {
      console.error("Error loading subscription requests:", error);
      toast.error("Failed to load subscription requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubscription || !actionType) return;

    try {
      setProcessingId(selectedSubscription.id);

      const response = await botService.approveRejectSubscription(
        selectedSubscription.id,
        actionType,
        adminNote.trim() || undefined
      );

      if (response.success) {
        toast.success(
          `Subscription ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`
        );

        // Update the list
        fetchSubscriptions();
        closeDialog();
      } else {
        toast.error(response.message || `Failed to ${actionType} subscription`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing subscription:`, error);
      toast.error(`Failed to ${actionType} subscription. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const openDialog = (
    subscription: BotSubscription,
    type: "approve" | "reject"
  ) => {
    setSelectedSubscription(subscription);
    setActionType(type);
    setAdminNote("");

    // If there's a payment proof URL, set it as preview
    if (
      subscription.paymentProofUrl &&
      isValidImageUrl(subscription.paymentProofUrl)
    ) {
      setPreviewImageUrl(subscription.paymentProofUrl);
    } else {
      setPreviewImageUrl(null);
    }

    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubscription(null);
    setActionType(null);
    setAdminNote("");
    setPreviewImageUrl(null);
  };

  const isValidImageUrl = (url: string) => {
    return (
      url.match(/\.(jpeg|jpg|gif|png)$/i) !== null || url.includes("cloudinary")
    );
  };

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    return (
      subscription.user?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.id.includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const formatBotType = (type: BotType) => {
    switch (type) {
      case BotType.BASIC:
        return "Basic Bot";
      case BotType.ADVANCED:
        return "Advanced Bot";
      case BotType.PRO:
        return "Pro Bot";
      default:
        return type;
    }
  };

  const formatStatus = (status: BotSubscriptionStatus) => {
    switch (status) {
      case BotSubscriptionStatus.PENDING:
        return {
          label: "Pending",
          className: "bg-yellow-50 text-yellow-600",
        };
      case BotSubscriptionStatus.ACTIVE:
        return {
          label: "Active",
          className: "bg-green-50 text-green-600",
        };
      case BotSubscriptionStatus.REJECTED:
        return {
          label: "Rejected",
          className: "bg-red-50 text-red-600",
        };
      case BotSubscriptionStatus.CANCELLED:
        return {
          label: "Cancelled",
          className: "bg-gray-50 text-gray-600",
        };
      case BotSubscriptionStatus.EXPIRED:
        return {
          label: "Expired",
          className: "bg-gray-50 text-gray-600",
        };
      default:
        return {
          label: status,
          className: "bg-gray-50 text-gray-600",
        };
    }
  };

  const getBotPrice = (botType: BotType) => {
    switch (botType) {
      case BotType.BASIC:
        return 5000;
      case BotType.ADVANCED:
        return 10000;
      case BotType.PRO:
        return 15000;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-[#171022] w-full min-h-screen p-5">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Manage Bot Subscription Requests
      </h2>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="border rounded-lg flex items-center border-[#ffffff80] pr-2 justify-center w-full md:w-auto">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search by user or ID"
            className="w-full placeholder:text-xs text-white bg-transparent p-2"
          />
          <IoIosSearch className="text-[#ffffffc4] text-2xl" />
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as BotSubscriptionStatus | "all")
            }
            defaultValue={statusFilter}
          >
            <SelectTrigger className="w-[180px] text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value={BotSubscriptionStatus.PENDING}>
                  Pending
                </SelectItem>
                <SelectItem value={BotSubscriptionStatus.ACTIVE}>
                  Active
                </SelectItem>
                <SelectItem value={BotSubscriptionStatus.REJECTED}>
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
                    "User",
                    "Subscription",
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
                    <td colSpan={7} className="p-5 text-center text-white">
                      Loading subscription requests...
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5 text-center text-white">
                      No subscription requests found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => {
                    const { label, className } = formatStatus(
                      subscription.status
                    );

                    return (
                      <tr
                        key={subscription.id}
                        className="transition-all duration-500 hover:bg-[#ffffff10]"
                      >
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {subscription.user ? (
                            <div>
                              <div className="font-medium">
                                {subscription.user.fullName}
                              </div>
                              <div className="text-xs opacity-75">
                                {subscription.user.email}
                              </div>
                            </div>
                          ) : (
                            "Unknown User"
                          )}
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {formatBotType(subscription.botType)}
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          PKR{" "}
                          {getBotPrice(subscription.botType).toLocaleString()}
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {formatDate(subscription.createdAt)}
                        </td>
                        <td className="p-5 text-sm font-medium opacity-90">
                          <div
                            className={`py-1.5 px-3 ${className} rounded-full flex justify-center w-24 items-center`}
                          >
                            <span className="font-medium text-xs">{label}</span>
                          </div>
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {subscription.paymentProofUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (subscription.paymentProofUrl) {
                                  setPreviewImageUrl(
                                    subscription.paymentProofUrl
                                  );
                                  setSelectedSubscription(subscription);
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
                          {subscription.status ===
                            BotSubscriptionStatus.PENDING && (
                            <>
                              <Button
                                onClick={() =>
                                  openDialog(subscription, "approve")
                                }
                                disabled={processingId === subscription.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-white"
                              >
                                <FaCheck size={12} />
                                Approve
                              </Button>
                              <Button
                                onClick={() =>
                                  openDialog(subscription, "reject")
                                }
                                disabled={processingId === subscription.id}
                                size="sm"
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <FaTimes size={12} />
                                Reject
                              </Button>
                            </>
                          )}
                          {subscription.status !==
                            BotSubscriptionStatus.PENDING && (
                            <span className="text-gray-400">
                              {subscription.status ===
                              BotSubscriptionStatus.ACTIVE
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

      {/* Dialog for Approving/Rejecting with image preview */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#2a1c40] text-white border-[#ffffff30]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {actionType === "approve"
                ? "Approve Subscription"
                : actionType === "reject"
                ? "Reject Subscription"
                : "View Payment Proof"}
            </DialogTitle>
            <DialogDescription className="text-[#ffffffb0]">
              {actionType
                ? `Are you sure you want to ${
                    actionType === "approve" ? "approve" : "reject"
                  } this ${formatBotType(
                    selectedSubscription?.botType || BotType.BASIC
                  )} subscription?`
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

          {selectedSubscription && (
            <div className="mt-2">
              <p className="mb-2 text-sm font-medium">Subscription Details:</p>
              <div className="rounded-md bg-[#ffffff10] p-4 space-y-2 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[#ffffff80]">User:</span>
                  <span className="text-right font-medium">
                    {selectedSubscription.user?.fullName}
                    <div className="text-xs text-[#ffffff90] font-normal">
                      {selectedSubscription.user?.email}
                    </div>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#ffffff80]">Bot Plan:</span>
                  <span className="text-right font-medium">
                    {formatBotType(selectedSubscription.botType)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#ffffff80]">Amount:</span>
                  <span className="text-right font-medium">
                    PKR{" "}
                    {getBotPrice(selectedSubscription.botType).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#ffffff80]">Request Date:</span>
                  <span className="text-right font-medium">
                    {formatDate(selectedSubscription.createdAt)}
                  </span>
                </div>
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
              className="border-[#ffffff30] text-black hover:bg-[#f1f1f1]"
            >
              {actionType ? "Cancel" : "Close"}
            </Button>

            {actionType && (
              <Button
                onClick={handleStatusUpdate}
                disabled={processingId === selectedSubscription?.id}
                className={
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {processingId === selectedSubscription?.id
                  ? "Processing..."
                  : actionType === "approve"
                  ? "Approve Subscription"
                  : "Reject Subscription"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BotSubscriptionManage;
