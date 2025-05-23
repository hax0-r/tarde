import { IoClose } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { Referral } from "../../../services/referralService";
import { format } from "date-fns";

interface ReferralTableProps {
  referrals: Referral[];
  isLoading: boolean;
}

const ReferralTable: React.FC<ReferralTableProps> = ({
  referrals,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-[#ffffff80]">Loading referral data...</p>
      </div>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-[#ffffff80]">
          No referrals found. Share your referral link to invite friends!
        </p>
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
                {["User ID", "Name", "Joined Date", "E-Mail", "Made Trade"].map(
                  (heading, index) => (
                    <th
                      key={index}
                      className="p-5 text-left font-medium text-white capitalize"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y text-nowrap divide-[#ffffff5d]">
              {referrals.map((referral) => (
                <tr
                  key={referral.id}
                  className="transition-all duration-500 hover:bg-[#ffffff10]"
                >
                  <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                    {referral.user._id.substring(0, 8)}...
                  </td>
                  <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                    {referral.user.fullName}
                  </td>
                  <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                    {formatDate(referral.joinedAt)}
                  </td>
                  <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                    {referral.user.email}
                  </td>
                  <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                    {referral.tradeAmount > 0 ? (
                      <FaCheck className="text-xl text-green-600" />
                    ) : (
                      <IoClose className="text-2xl text-red-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralTable;
