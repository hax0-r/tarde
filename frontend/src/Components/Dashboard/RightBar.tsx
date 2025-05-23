import { FiUser } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import PaymentMethods from "./PaymentMethods";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { RiRobot2Line } from "react-icons/ri";
import { BotType } from "../../services/botService";

interface RightBarProps {
  amount: number;
  setAmount: (amount: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  onStartTrade: () => void;
  isLoading: boolean;
  botActive: boolean;
  botType: BotType | null;
  botProfitRate: number;
  balance: number;
}

const RightBar = ({
  amount,
  setAmount,
  duration,
  setDuration,
  onStartTrade,
  isLoading,
  botActive,
  botType,
  botProfitRate,
  balance,
}: RightBarProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="bg-[#171022] w-96 p-4 md:block hidden">
        <div className="flex items-center justify-between gap-5">
          <Sheet>
            <SheetTrigger className="bg-[#5f29b7e0] text-white px-16 py-3 rounded-lg cursor-pointer hover:opacity-80 transition-all duration-500">
              Payment
            </SheetTrigger>
            <SheetContent>
              <PaymentMethods />
            </SheetContent>
          </Sheet>

          <Link
            to={"/user-dashboard"}
            className="w-12 h-12 hover:opacity-80 transition-all duration-500 cursor-pointer bg-[#5f29b760] flex items-center justify-center text-white rounded-full"
          >
            <FiUser className="text-2xl" />
          </Link>
        </div>

        {/* Amount Section */}
        <div className="mt-7">
          <label className="text-zinc-500 text-sm">Amount</label>
          <input
            type="number"
            className="p-3 w-full mt-1 border border-[#3f2b5f] rounded-lg text-white"
            placeholder="5,000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setAmount(Math.max(5000, amount - 1000))}
              className="bg-[#5f29b760] hover:opacity-80 transition-all duration-500 active:scale-95 w-full py-0.5 rounded-full text-2xl text-white cursor-pointer"
            >
              -
            </button>
            <button
              onClick={() => setAmount(Math.min(50000, amount + 1000))}
              className="bg-[#5f29b760] hover:opacity-80 transition-all duration-500 active:scale-95 w-full py-0.5 rounded-full text-2xl text-white cursor-pointer"
            >
              +
            </button>
          </div>
          <p className="text-xs text-[#ffffff80] mt-1">
            Available Balance: {formatCurrency(balance)}
          </p>
        </div>

        {/* Duration Section */}
        <div className="mt-7">
          <label className="text-zinc-500 text-sm">Duration</label>
          <input
            type="text"
            className="p-3 w-full mt-1 border border-[#3f2b5f] rounded-lg text-white appearance-none"
            value={`${duration} min`}
            readOnly
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setDuration(Math.max(5, duration - 5))}
              className="bg-[#5f29b760] hover:opacity-80 transition-all duration-500 active:scale-95 w-full py-0.5 rounded-full text-2xl text-white cursor-pointer"
            >
              -
            </button>
            <button
              onClick={() => setDuration(duration + 5)}
              className="bg-[#5f29b760] hover:opacity-80 transition-all duration-500 active:scale-95 w-full py-0.5 rounded-full text-2xl text-white cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-7">
          <label className="text-zinc-500 text-sm">Start Trade</label>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onStartTrade}
              disabled={isLoading}
              className="bg-[#5f29b7] hover:opacity-80 transition-all duration-500 active:scale-95 w-full py-3 rounded-lg text-white cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Start Trade"}
            </button>
          </div>

          <div className="relative mt-5 rounded-lg overflow-hidden">
            <Button
              className={`${botActive ? "bg-[#5726a8]" : "bg-transparent"} ${
                botActive ? "opacity-100" : "opacity-20"
              } active:translate-y-0.5 border border-[#5726a8] w-full`}
            >
              <RiRobot2Line className="mr-2" />
              {botActive ? `${botType} Bot (${botProfitRate}%)` : "Enable Bot"}
            </Button>
            {!botActive && (
              <div className="w-full h-full cursor-not-allowed flex items-center justify-center bg-[#2c174f56] absolute top-0 left-0">
                <FiLock className="text-[#ffffffe3] text-2xl" />
              </div>
            )}
          </div>
          {!botActive && (
            <p className="text-xs mt-2 tracking-wide text-[#ffffff4b]">
              Enable bot for more profitable trades
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default RightBar;
