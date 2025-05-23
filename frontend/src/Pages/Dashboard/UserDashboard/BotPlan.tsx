import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";
import { FiImage, FiX } from "react-icons/fi";
import { Button } from "../../../Components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "../../../Components/ui/input";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import fileUploadService from "../../../services/fileUploadService";
import botService, {
  ActiveBotSubscriptionResponse,
  BotType,
} from "../../../services/botService";
import { AxiosError } from "axios";

// Dummy trading bot plans
const botPlans = [
  {
    name: "Free",
    price: "$0.00/month",
    features: {
      "Basic Bot": false,
      "Advanced Bot": false,
      "Pro Bot": false,
    },
  },
  {
    name: "Basic Bot",
    price: "$29/month",
    features: {
      "Basic Bot": true,
      "Advanced Bot": false,
      "Pro Bot": false,
    },
  },
  {
    name: "Advanced Bot",
    price: "$59/month",
    features: {
      "Basic Bot": true,
      "Advanced Bot": true,
      "Pro Bot": false,
    },
  },
  {
    name: "Pro Bot",
    price: "$99/month",
    features: {
      "Basic Bot": true,
      "Advanced Bot": true,
      "Pro Bot": true,
    },
  },
];

// Bank account details to be displayed
const bankDetails = {
  accountTitle: "Wealthy Way Trade",
  accountNumber: "1234567890123456",
  bankName: "Soneri Bank",
  branch: "Main Branch",
};

const BotPlan = () => {
  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<string>("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeSubscription, setActiveSubscription] =
    useState<ActiveBotSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch active subscription on component mount
  useEffect(() => {
    fetchActiveSubscription();
  }, []);

  const fetchActiveSubscription = async () => {
    try {
      setLoading(true);
      const response = await botService.getActiveBotSubscription();

      if (response.success && response.data) {
        setActiveSubscription(response.data);
      }
    } catch (error) {
      console.error("Error fetching active subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle opening the payment modal
  const handleBuyNowClick = (botName: string) => {
    setSelectedBot(botName);
    setIsPaymentModalOpen(true);
  };

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  // Function to remove selected file
  const removeFile = () => {
    setScreenshot(null);
    const fileInput = document.getElementById(
      "payment-screenshot"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Function to get file preview URL
  const getPreviewUrl = () => {
    if (screenshot) {
      return URL.createObjectURL(screenshot);
    }
    return "";
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Helper function to get bot price amount
  const getBotPriceAmount = (botName: string): number => {
    switch (botName) {
      case "Basic Bot":
        return 5000; // PKR
      case "Advanced Bot":
        return 10000; // PKR
      case "Pro Bot":
        return 15000; // PKR
      default:
        return 0;
    }
  };

  // Function to handle payment submission
  const handlePaymentSubmit = async () => {
    if (!screenshot) {
      toast.error("Please upload a screenshot of your payment");
      return;
    }

    try {
      setIsSubmitting(true);
      // First upload the screenshot to Cloudinary
      const uploadResponse = await fileUploadService.uploadFile(screenshot);

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error("Failed to upload screenshot");
      }

      // Convert bot name to the expected planId format
      const planId = getBotPlanId(selectedBot);

      // Submit the bot subscription request
      const response = await botService.requestBotSubscription({
        planId,
        paymentProofUrl: uploadResponse.data.fileUrl,
      });

      if (response.success) {
        toast.success(`Payment for ${selectedBot} submitted successfully`);
        toast.info("Your subscription request will be reviewed by our team");
        setScreenshot(null);
        setIsPaymentModalOpen(false);
        // Refresh active subscription data to show pending status
        fetchActiveSubscription();
      } else {
        toast.error(response.message || "Failed to process payment");
      }
    } catch (error: unknown) {
      console.error("Error processing payment:", error);
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to process payment. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert bot name to planId format
  const getBotPlanId = (botName: string): BotType => {
    switch (botName) {
      case "Basic Bot":
        return BotType.BASIC;
      case "Advanced Bot":
        return BotType.ADVANCED;
      case "Pro Bot":
        return BotType.PRO;
      default:
        return BotType.BASIC;
    }
  };

  // Helper function to check if a bot is active
  const isBotActive = (botName: string): boolean => {
    if (!activeSubscription || !activeSubscription.isActive) return false;

    const botType = getBotPlanId(botName);
    return activeSubscription.botType === botType;
  };

  // Helper function to check if a bot is pending approval
  const isBotPending = (botName: string): boolean => {
    if (!activeSubscription || !activeSubscription.isPending) return false;

    const botType = getBotPlanId(botName);
    return activeSubscription.botType === botType;
  };

  // Helper function to check if any bot is active or pending
  const isAnyBotActiveOrPending = (): boolean => {
    return !!(
      activeSubscription &&
      (activeSubscription.isActive || activeSubscription.isPending)
    );
  };

  return (
    <UserDashboardLeftBar breadcrumb="Trading Bots">
      <div className="flex flex-col">
        <div className="overflow-x-auto pb-3">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden rounded-lg">
              <table className="min-w-full rounded-xl">
                <thead>
                  <tr className="bg-[#ffffff0e] text-white">
                    <th className="p-5 font-medium text-left leading-6 capitalize rounded-tl-xl">
                      Profits Plan
                    </th>
                    <th className="p-5 font-medium leading-6 capitalize text-center">
                      basic{" "}
                      <span className="text-xs opacity-60"> ( 10% -15% ) </span>
                    </th>
                    <th className="p-5 font-medium leading-6 capitalize text-center">
                      Advance{" "}
                      <span className="text-xs opacity-60"> ( 15% -20% ) </span>
                    </th>
                    <th className="p-5 font-medium leading-6 capitalize text-center">
                      Pro{" "}
                      <span className="text-xs opacity-60"> ( 20% -25% ) </span>
                    </th>
                    <th className="p-5 font-medium leading-6 capitalize text-center rounded-tr-xl">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffffff48]">
                  {botPlans.map((bot, index) => (
                    <tr
                      key={index}
                      className=" transition-all duration-500 hover:bg-[#ffffff0a]"
                    >
                      <td className="px-5 py-6 text-sm font-medium text-[#ffffffd0]">
                        {bot.name}
                      </td>
                      {Object.values(bot.features).map(
                        (hasFeature, featureIndex) => (
                          <td
                            key={featureIndex}
                            className="px-5 py-6 text-sm font-medium"
                          >
                            <div className="flex justify-center">
                              {hasFeature ? (
                                <FaCheck className="text-xl text-green-600" />
                              ) : (
                                <IoClose className="text-2xl text-red-700" />
                              )}
                            </div>
                          </td>
                        )
                      )}
                      <td className="px-5 py-6 font-medium text-center text-[#ffffffd0]">
                        {bot.price}
                      </td>
                    </tr>
                  ))}
                  {/* Buy Now Row */}
                  <tr>
                    <td />
                    {botPlans.slice(1).map((bot, index) => (
                      <td
                        key={index}
                        className="p-5 text-sm font-medium text-center"
                      >
                        {isBotActive(bot.name) ? (
                          <div className="bg-green-600 text-white py-2 px-4 rounded-full font-medium">
                            Subscribed
                          </div>
                        ) : isBotPending(bot.name) ? (
                          <div className="bg-yellow-600 text-white py-2 px-4 rounded-full font-medium">
                            Pending Approval
                          </div>
                        ) : (
                          <Button
                            className="rounded-full md:px-8"
                            onClick={() => handleBuyNowClick(bot.name)}
                            disabled={loading || isAnyBotActiveOrPending()}
                          >
                            Buy {bot.name}
                          </Button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Marketing Message */}
        <div className="text-center mt-6">
          <h2 className="md:text-xl text-lg md:tracking-wide text-[#ffffffd0]">
            Maximize Your Profits with AI Trading Bots
          </h2>
          <p className="text-[#ffffff8a] mt-2">
            Get access to cutting-edge trading bots that automate your trades,
            analyze market trends, and provide AI-driven insights. Choose the
            right plan and start optimizing your investments today!
          </p>
        </div>

        {/* Subscription Status Message */}
        {activeSubscription && activeSubscription.isActive && (
          <div className="bg-[#1e1332] border border-green-500/20 rounded-lg p-4 mt-6">
            <p className="text-green-400 text-center">
              You are currently subscribed to the {activeSubscription.botType}{" "}
              bot. Your subscription will expire on{" "}
              {new Date(activeSubscription.endDate || "").toLocaleDateString()}.
              {activeSubscription.remainingDays !== undefined && (
                <span className="block mt-1 text-sm">
                  {activeSubscription.remainingDays} days remaining
                </span>
              )}
            </p>
          </div>
        )}

        {activeSubscription && activeSubscription.isPending && (
          <div className="bg-[#1e1332] border border-yellow-500/20 rounded-lg p-4 mt-6">
            <p className="text-yellow-400 text-center">
              Your subscription request for the {activeSubscription.botType} bot
              is pending approval. We will notify you once it's approved.
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#171022] border-[#5f29b7]/50">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Payment for {selectedBot}
            </DialogTitle>
            <DialogDescription className="text-[#ffffffb0]">
              Please make a payment to our bank account and upload proof of
              payment.
            </DialogDescription>
          </DialogHeader>

          {/* Bank Details */}
          <div className="bg-[#ffffff10] rounded-lg p-4 border border-[#ffffff20] mb-4">
            <h3 className="text-base font-semibold mb-3 text-white">
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#ffffff80]">Account Title</p>
                <p className="font-medium text-sm flex items-center gap-2 text-white">
                  {bankDetails.accountTitle}
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountTitle)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy account title"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#ffffff80]">Account Number</p>
                <p className="font-medium text-sm flex items-center gap-2 text-white">
                  {bankDetails.accountNumber}
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy account number"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#ffffff80]">Bank Name</p>
                <p className="font-medium text-sm flex items-center gap-2 text-white">
                  {bankDetails.bankName}
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy bank name"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#ffffff80]">Branch</p>
                <p className="font-medium text-sm flex items-center gap-2 text-white">
                  {bankDetails.branch}
                  <button
                    onClick={() => copyToClipboard(bankDetails.branch)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy branch name"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mb-4">
            <p className="text-sm mb-2 text-white">Payment Amount</p>
            <Input
              value={`PKR ${getBotPriceAmount(selectedBot).toLocaleString()}`}
              disabled
              className="bg-[#ffffff14] border-[#ffffff1a] text-white"
            />
          </div>

          {/* Screenshot Upload */}
          <div>
            <p className="text-sm mb-2 text-white">Payment Screenshot</p>
            <div className="relative border border-[#ffffff30] bg-[#ffffff10] rounded-md overflow-hidden h-[140px]">
              {screenshot ? (
                <div className="relative h-full">
                  <img
                    src={getPreviewUrl()}
                    alt="Payment screenshot"
                    className="w-full h-full object-contain bg-black"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00000080] flex items-end p-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-white truncate max-w-[80%]">
                        {screenshot.name}
                      </span>
                      <button
                        onClick={removeFile}
                        className="bg-[#ffffff20] hover:bg-[#ffffff40] transition-colors p-1.5 rounded-full"
                        type="button"
                      >
                        <FiX className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="payment-screenshot"
                  className="cursor-pointer block h-full"
                >
                  <div className="flex flex-col items-center justify-center py-6 px-4 h-full">
                    <div className="h-10 w-10 bg-[#ffffff20] rounded-full flex items-center justify-center mb-2">
                      <FiImage className="text-white h-5 w-5" />
                    </div>
                    <p className="text-white font-medium text-center text-sm">
                      Click to upload payment proof
                    </p>
                    <p className="text-[#ffffff80] text-xs text-center mt-0.5">
                      PNG, JPG or JPEG (max 5MB)
                    </p>
                  </div>
                  <input
                    id="payment-screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-[#ffffff80] mt-1">
              Please upload a screenshot of your payment as proof
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="bg-transparent border-[#ffffff30] text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handlePaymentSubmit}
              className="bg-[#5f29b7] text-white hover:bg-[#5f29b7]/80"
              disabled={!screenshot || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserDashboardLeftBar>
  );
};

export default BotPlan;
