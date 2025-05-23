import { useState, useEffect } from "react";
import DashboardCard from "../../../Components/Dashboard/DashboardCard";
import { Button } from "../../../Components/ui/button";
import { GrUserAdmin } from "react-icons/gr";
import { GrMoney } from "react-icons/gr";
import { RiStackshareLine } from "react-icons/ri";
import { BsCurrencyDollar } from "react-icons/bs";
import ReferralTable from "../../../Components/Dashboard/UserDashboard/ReferralTable";
import { useNavigate, useParams } from "react-router";
import { BiArrowBack } from "react-icons/bi";
import userService, {
  UserDetail as UserDetailType,
} from "../../../services/userService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const UserDetail = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [userDetails, setUserDetails] = useState<UserDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState("");

  useEffect(() => {
    if (!userId) {
      toast.error("User ID is required");
      navigate("/admin-dashboard");
      return;
    }

    // Get current domain
    setCurrentDomain(window.location.origin);

    fetchUserDetails(userId);
  }, [userId, navigate]);

  const fetchUserDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await userService.getUserDetails(id);
      if (response.success && response.data) {
        setUserDetails(response.data);
      } else {
        toast.error(response.message || "Failed to load user details");
        navigate("/admin-dashboard");
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("Failed to load user details. Please try again.");
      navigate("/admin-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getDefaultProfileImage = () => {
    return "https://pagedone.io/asset/uploads/1705471668.png";
  };

  const adaptReferrals = () => {
    if (!userDetails?.referrals) return [];

    return userDetails.referrals.map((referral) => ({
      id: referral.id,
      user: {
        _id:
          typeof referral.user === "object" && "id" in referral.user
            ? String(referral.user.id)
            : typeof referral.user === "object" && "_id" in referral.user
            ? String(referral.user._id)
            : String(referral.id),
        fullName:
          typeof referral.user === "object" && "fullName" in referral.user
            ? String(referral.user.fullName)
            : "Unknown",
        email:
          typeof referral.user === "object" && "email" in referral.user
            ? String(referral.user.email)
            : "No email",
      },
      tradeAmount: 0, // Default value as we don't have this data
      rewardAmount: 0, // Default value as we don't have this data
      isRewardClaimed: false, // Default value as we don't have this data
      joinedAt: referral.joinedAt,
    }));
  };

  if (loading) {
    return (
      <div className="bg-[#171022] w-full min-h-screen p-5 flex items-center justify-center">
        <div className="text-white text-xl">Loading user details...</div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="bg-[#171022] w-full min-h-screen p-5 flex items-center justify-center">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#171022] w-full min-h-screen p-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-white mb-3 opacity-80 cursor-pointer"
        >
          <BiArrowBack /> Back{" "}
        </button>

        <section className="relative pt-40 pb-24">
          <img
            src="/images/bgTrade.png"
            alt="cover-image"
            className="w-full rounded-lg absolute top-0 left-0 z-0 h-60 object-cover"
          />
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-center sm:justify-start relative z-10 mb-5">
              <img
                src={userDetails.profileImage || getDefaultProfileImage()}
                alt="user-avatar-image"
                className="w-32 h-32 border-4 border-solid border-[#6d45b9] rounded-full object-cover"
              />
            </div>
            <div className="flex items-center justify-center flex-col sm:flex-row max-sm:gap-5 sm:justify-between mb-5">
              <div className="block">
                <h3 className="text-3xl text-[#ffffffe5] mb-1 max-sm:text-center">
                  {userDetails.fullName}
                </h3>
                <p className="font-normal text-base leading-7 text-gray-400 max-sm:text-center">
                  {userDetails.email}
                </p>
                <p className="font-normal text-base leading-7 text-gray-400 max-sm:text-center">
                  User since: {formatDate(userDetails.createdAt)}
                </p>
                <p
                  className={`font-normal text-base leading-7 max-sm:text-center ${
                    userDetails.isVerified
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  Status: {userDetails.isVerified ? "Active" : "Inactive"}
                </p>
              </div>
              <Button className="rounded-full py-6">
                <GrUserAdmin className="ml-2" />
                <span className="pr-2 capitalize text-base leading-7 text-white">
                  Make as Admin
                </span>
              </Button>
            </div>
            <div className="">
              <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
                <DashboardCard
                  title="Account Balance"
                  amount={`$ ${userDetails.balance.toFixed(2)}`}
                  description="Funds available for trading."
                  icon={BsCurrencyDollar}
                />
                <DashboardCard
                  title="Total Profit"
                  amount={`$ ${userDetails.totalProfit.toFixed(2)}`}
                  description="Earnings eligible for withdrawal."
                  icon={GrMoney}
                />
                <DashboardCard
                  title="Referred Friends"
                  amount={userDetails.referralCount.toString()}
                  description="Friends user has successfully invited."
                  icon={RiStackshareLine}
                />
              </div>
            </div>

            {userDetails.paymentMethods &&
              userDetails.paymentMethods.length > 0 && (
                <>
                  <h2 className="text-3xl text-[#ffffffe5] mb-1 max-sm:text-center mt-10 capitalize">
                    Payment Accounts
                  </h2>
                  <div className="flex flex-col gap-5 mt-5">
                    {userDetails.paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-purple-800">
                            {method.type.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg text-white">{method.type}</p>
                          <p className="text-sm text-gray-400">{method.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            <div className="flex md:flex-row flex-col-reverse md:items-center gap-2 mt-8">
              <input
                type="text"
                className="w-full text-white p-2 border border-[#ffffff3b] rounded-lg"
                value={`${currentDomain}/register?ref=${userDetails.referralCode}`}
                readOnly
              />
              <Button className="bg-[#6d45b9]">User's Referral Link</Button>
            </div>

            <h2 className="text-3xl text-[#ffffffe5] mb-1 max-sm:text-center mt-10 capitalize">
              Referred Friends
            </h2>
            <ReferralTable referrals={adaptReferrals()} isLoading={false} />

            <h2 className="text-3xl text-[#ffffffe5] mb-1 max-sm:text-center md:mt-10 mt-6 capitalize">
              Recent Transactions
            </h2>
            {userDetails.transactions && userDetails.transactions.length > 0 ? (
              <div className="bg-[#2a1c40] p-4 text-white rounded-lg mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-900">
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetails.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-purple-900/30">
                        <td className="p-2">{tx.id.substring(0, 8)}...</td>
                        <td className="p-2 capitalize">{tx.type}</td>
                        <td className="p-2">PKR {tx.amount}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              tx.status === "completed"
                                ? "bg-green-500/20 text-green-500"
                                : tx.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {tx.status.charAt(0).toUpperCase() +
                              tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#2a1c40] p-4 text-white rounded-lg mt-4 text-center">
                No transactions found for this user
              </div>
            )}

            <Button onClick={() => navigate(-1)} className="mt-5 w-full">
              <BiArrowBack />
              Back To Admin Dashboard
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default UserDetail;
