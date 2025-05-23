import { useState, useEffect } from "react";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { GrMoney } from "react-icons/gr";
import { RiStackshareLine } from "react-icons/ri";
import { BsCurrencyDollar } from "react-icons/bs";
import Chart from "../../../Components/Dashboard/UserDashboard/Dashboard/Chart";
import DashboardCard from "../../../Components/Dashboard/DashboardCard";
import authService from "../../../services/authService";
import referralService from "../../../services/referralService";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [referrals, setReferrals] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [profit, setProfit] = useState<number>(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile to get balance and totalProfit
      const profileResponse = await authService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setBalance(profileResponse.data.balance);
        setProfit(profileResponse.data.totalProfit); // Use totalProfit from API
        console.log("User profile data:", profileResponse.data);
      }

      // Fetch user referrals to get count
      const referralsResponse = await referralService.getReferrals();
      if (referralsResponse.success && referralsResponse.data) {
        console.log("Referrals data:", referralsResponse.data);
        setReferrals(referralsResponse.data.referralCount);
      } else {
        console.warn("Failed to get referrals:", referralsResponse);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <UserDashboardLeftBar breadcrumb="Dashboard">
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
          <DashboardCard
            title="Account Balance"
            amount={loading ? "Loading..." : formatCurrency(balance)}
            description="Funds available for trading."
            icon={BsCurrencyDollar}
          />
          <DashboardCard
            title="Total Profit"
            amount={loading ? "Loading..." : formatCurrency(profit)}
            description="Earnings from your trades."
            icon={GrMoney}
          />
          <DashboardCard
            title="Referred Friends"
            amount={loading ? "..." : referrals.toString()}
            description="Friends you've successfully invited."
            icon={RiStackshareLine}
          />
        </div>

        {profit > 0 && (
          <div className="mt-4 p-4 bg-[#1e1332] rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <GrMoney className="text-green-400" />
              <span className="text-green-400 font-medium">
                Trading Profit Summary
              </span>
            </div>
            <p className="text-[#ffffffb0] text-sm mt-2">
              You have earned a total of {formatCurrency(profit)} in profits
              from your trading activities.
              {profit > 10000 && " Great job with your trading strategy!"}
            </p>
          </div>
        )}

        <div className="mt-10">
          <Chart />
        </div>
      </UserDashboardLeftBar>
    </div>
  );
};

export default UserDashboard;
