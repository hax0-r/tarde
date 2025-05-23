import { Link } from "react-router";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { Button } from "../../../Components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ReferralTable from "../../../Components/Dashboard/UserDashboard/ReferralTable";
import referralService, {
  ReferralData,
} from "../../../services/referralService";

const Referral = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch referral data on component mount
  useEffect(() => {
    fetchReferralData();
  }, []);

  // Generate correct referral link with current domain
  useEffect(() => {
    if (referralData) {
      // Get current domain
      const currentDomain = window.location.origin;

      // Extract referral code from the backend-provided URL
      const refCodeMatch = referralData.referralLink.match(/ref=([A-Z0-9]+)$/);
      const referralCode = refCodeMatch
        ? refCodeMatch[1]
        : referralData.referralCode;

      // Create new URL with current domain
      const newReferralLink = `${currentDomain}/register?ref=${referralCode}`;
      setReferralLink(newReferralLink);
    }
  }, [referralData]);

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);
      const response = await referralService.getReferrals();
      if (response.success && response.data) {
        setReferralData(response.data);
      } else {
        toast.error(response.message || "Failed to load referral data");
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      toast.success("Link copied to clipboard!", {
        // dark color
        style: {
          background: "#261b38",
          color: "#fff",
        },
      });
    }
  };

  // Function to claim rewards
  const handleClaimReward = async () => {
    try {
      const response = await referralService.claimReward();
      if (response.success) {
        toast.success(response.message || "Reward claimed successfully!");
        fetchReferralData(); // Refresh data after claiming
      } else {
        toast.error(response.message || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Failed to claim reward. Please try again.");
    }
  };

  return (
    <UserDashboardLeftBar breadcrumb="Referral">
      <div className="grid md:grid-cols-4 grid-cols-1 gap-4 ">
        <div className="w-full p-5 md:col-span-2 flex justify-between overflow-hidden relative rounded-lg bg-[#6d45b9]">
          <div className="md:max-w-[60%] w-full">
            <h3 className="md:text-2xl text-xl">
              Invite your friends and earn rewards! 🎉
            </h3>
            <div className="bg-[#ffffff27] mt-4 p-4 rounded-lg">
              <p className="text-xs opacity-50">Share your invite link</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full p-2 border border-[#ffffff3b] rounded-lg"
                  value={isLoading ? "Loading..." : referralLink}
                  readOnly
                />
                <Button className="bg-[#6d45b9]" onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-sm opacity-70 mt-3">
              Your referral code:{" "}
              <span className="font-semibold">
                {referralData?.referralCode || "Loading..."}
              </span>
            </p>
          </div>
          <img
            src="/images/coin.png"
            className="h-60 md:block hidden absolute -bottom-5 -right-5"
            alt=""
          />
        </div>
        <div className="w-full p-5 overflow-hidden md:flex hidden flex-col justify-center relative rounded-lg bg-[#6d45b9]">
          <h3 className="md:text-2xl text-xl">Monthly Bonus</h3>
          <p className="text-sm opacity-70 mt-3">
            You have earned{" "}
            <span className="text-[#ffb700]">
              {referralData
                ? `${referralData.totalReward.toFixed(2)} Rs`
                : "0.00 Rs"}
            </span>{" "}
            in total.
          </p>
          <p className="text-sm opacity-70 mt-3">
            You have invited{" "}
            <span className="text-[#ffb700]">
              {referralData?.referralCount || 0}
            </span>{" "}
            friends.
          </p>
          <Button
            className="bg-[#6134b4] mt-4 capitalize tracking-wide"
            onClick={handleClaimReward}
            disabled={!referralData?.eligibleForReward}
          >
            {referralData?.eligibleForReward
              ? "Claim Reward"
              : `Need ${
                  25 - (referralData?.referralCount || 0)
                } more referrals`}
          </Button>
        </div>
        <div className="w-full p-5 overflow-hidden md:flex hidden flex-col justify-center relative rounded-lg bg-[#6d45b9]">
          <h3 className="md:text-2xl text-xl">Boost Your Earnings</h3>
          <p className="text-sm opacity-70 mt-3">
            Purchase a bot plan and take your trading to the next level.
            Automate your strategy, increase your profit, and trade faster with
            better results.
          </p>
          <Link to={"/bot-plan"} className="w-full">
            <Button className="bg-[#6134b4] capitalize w-full tracking-wide">
              See Bot plans
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-medium mb-4">Your Referrals</h3>
        <ReferralTable
          referrals={referralData?.referrals || []}
          isLoading={isLoading}
        />
      </div>
    </UserDashboardLeftBar>
  );
};

export default Referral;
