import { useEffect, useState } from "react";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { Input } from "../../../Components/ui/input";
import transactionService from "../../../services/transactionService";
import { toast } from "react-toastify";
import { Button } from "../../../Components/ui/button";
import authService from "../../../services/authService";
import { AxiosError } from "axios";

interface UserProfile {
  balance: number;
}

const Withdrawal = () => {
  // State for withdrawal amount
  const [amount, setAmount] = useState<string>("");
  // State for loading indicators
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // State for user profile data (balance shown for reference only)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Function to fetch user's profile data (to display balance for reference)
  const fetchUserProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error(
        "Failed to load your account information. Please refresh the page."
      );
    }
  };

  // Function to format amount with PKR and commas
  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Function to handle withdrawal submission
  const handleWithdrawal = async () => {
    // Validate input
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (amountValue < 5000) {
      toast.error("Minimum withdrawal amount is PKR 5,000");
      return;
    }

    if (amountValue > 50000) {
      toast.error("Maximum withdrawal amount is PKR 50,000");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await transactionService.createWithdrawal({
        amount: amountValue,
        paymentMethodId: "manual", // Using 'manual' as we're not collecting payment method
      });

      if (response.success) {
        toast.success("Withdrawal request submitted successfully");
        // Reset form
        setAmount("");
      } else {
        toast.error(response.message || "Failed to process withdrawal request");
      }
    } catch (error: unknown) {
      console.error("Error processing withdrawal:", error);
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to process withdrawal. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserDashboardLeftBar breadcrumb="Withdrawal">
      <h2 className="md:text-3xl text-xl mt-4 tracking-wide font-semibold">
        Withdrawal Money
      </h2>
      <div className="flex md:flex-row flex-col mt-6 items-start justify-between md:gap-20 gap-8">
        <div className="md:max-w-[50%] w-full">
          <p className="text-sm mb-2 mt-8">Withdraw Amount</p>
          <Input
            placeholder="PKR 5,000.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="5000"
            max="50000"
            disabled={isSubmitting}
          />

          <Button
            className="w-full rounded-lg p-6 text-white bg-[#5f29b7] cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 mt-4"
            onClick={handleWithdrawal}
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? "Processing..." : "Request Withdrawal"}
          </Button>
        </div>
        <div className="md:max-w-[50%] w-full">
          {userProfile && (
            <h2 className="text-xl capitalize mt-4 tracking-wide font-semibold">
              Current Balance: {formatAmount(userProfile.balance)}
            </h2>
          )}

          <p className="text-[#ffffffaf] md:mt-8 mt-5">
            You can request a withdrawal at any time. Our admin team will review
            your request and process it manually.
            <br />
            <br />
            Withdrawal processing usually takes 1-3 business days after
            approval.
            <br />
            <br />
            The amount will be sent to your registered payment method. Please
            ensure your payment details are up to date.
          </p>
        </div>
      </div>
    </UserDashboardLeftBar>
  );
};

export default Withdrawal;
