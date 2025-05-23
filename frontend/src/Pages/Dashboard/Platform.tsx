import { useState, useEffect } from "react";
import BottomBar from "../../Components/Dashboard/BottomBar";
import LeftBar from "../../Components/Dashboard/LeftBar";
import RightBar from "../../Components/Dashboard/RightBar";
import TopBar from "../../Components/Dashboard/TopBar";
import TradingViewWidget from "../../Components/Dashboard/TradingViewWidget";
import authService from "../../services/authService";
import tradeService from "../../services/tradeService";
import { toast } from "react-toastify";
import botService, { BotType } from "../../services/botService";

const Platform = () => {
  // User data state
  const [balance, setBalance] = useState<number>(0);
  const [activeSubscription, setActiveSubscription] = useState<boolean>(false);
  const [botType, setBotType] = useState<BotType | null>(null);

  // Trade state
  const [amount, setAmount] = useState<number>(5000);
  const [duration, setDuration] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [tradeStatus, setTradeStatus] = useState<
    "idle" | "processing" | "completed"
  >("idle");
  const [tradeResult, setTradeResult] = useState<{
    amount: number;
    profit: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchBotSubscription();
  }, []);

  const fetchUserData = async () => {
    try {
      const profileResponse = await authService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setBalance(profileResponse.data.balance);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchBotSubscription = async () => {
    try {
      const response = await botService.getActiveBotSubscription();
      if (response.success && response.data && response.data.isActive) {
        setActiveSubscription(true);
        if (response.data.botType) {
          setBotType(response.data.botType);
        }
      }
    } catch (error) {
      console.error("Error fetching bot subscription:", error);
    }
  };

  const handleStartTrade = async () => {
    console.log("Starting trade with amount:", amount, "duration:", duration);

    // Validate input
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid trade amount");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance for this trade");
      return;
    }

    if (amount < 5000) {
      toast.error("Minimum trade amount is PKR 5,000");
      return;
    }

    if (amount > 50000) {
      toast.error("Maximum trade amount is PKR 50,000");
      return;
    }

    try {
      setLoading(true);
      setTradeStatus("processing");

      // Start the trade
      const response = await tradeService.startTrade({
        amount,
        duration,
        isBot: activeSubscription,
      });

      console.log("Trade response:", response); // Log the full response

      if (response.success && response.data) {
        // Extract the trade ID - check multiple possible property names
        const tradeId =
          response.data.id || response.data.tradeId || response.data._id;

        console.log("Trade ID extracted:", tradeId); // Log the extracted ID

        if (!tradeId) {
          console.error("No trade ID found in API response:", response.data);
          // Fallback to local simulation if no trade ID
          simulateLocalTrade(amount);
          return;
        }

        // For UI demo purposes, we'll use a shorter time (10 seconds)
        const demoTime = 10 * 1000;

        setTimeout(() => {
          completeTrade(tradeId, amount);
        }, demoTime);

        toast.success("Trade started successfully");
      } else {
        setTradeStatus("idle");
        toast.error(response.message || "Failed to start trade");
      }
    } catch (error) {
      console.error("Error starting trade:", error);

      // Fallback to local simulation for demo
      simulateLocalTrade(amount);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to simulate a trade locally if API isn't available
  const simulateLocalTrade = (tradeAmount: number) => {
    toast.info("Simulating trade locally (development mode)");

    // For UI demo purposes, we'll use a shorter time (10 seconds)
    const demoTime = 10 * 1000;

    setTimeout(() => {
      const profitPercentage = Math.floor(Math.random() * 6) + 10; // 10-15%
      const profit = Math.floor(tradeAmount * (profitPercentage / 100));

      // Update local state for UI
      setTradeResult({
        amount: tradeAmount,
        profit,
        percentage: profitPercentage,
      });
      setTradeStatus("completed");
      setBalance((prevBalance) => prevBalance + profit); // Only add profit for local simulation

      toast.success(`Trade completed! You earned ${formatCurrency(profit)}`);

      // Reset after 10 seconds
      setTimeout(() => {
        setTradeStatus("idle");
        setTradeResult(null);
      }, 10000);
    }, demoTime);
  };

  const completeTrade = async (tradeId: string, tradeAmount: number) => {
    try {
      console.log("Completing trade with ID:", tradeId); // Log the trade ID

      // Calculate profit based on bot type or default rate
      let profitPercentage = 10; // Default 10%

      if (activeSubscription && botType) {
        switch (botType) {
          case BotType.BASIC:
            profitPercentage = 12; // 12% profit for basic bot
            break;
          case BotType.ADVANCED:
            profitPercentage = 14; // 14% profit for advanced bot
            break;
          case BotType.PRO:
            profitPercentage = 15; // 15% profit for pro bot
            break;
          default:
            profitPercentage = 10; // Default
        }
      } else {
        // If no bot, randomize between 10-15%
        profitPercentage = Math.floor(Math.random() * 6) + 10;
      }

      const profit = Math.floor(tradeAmount * (profitPercentage / 100));

      // Call API to complete the trade
      const response = await tradeService.completeTrade({
        tradeId,
        profit,
        profitPercentage,
      });

      console.log("Complete trade response:", response);

      if (response.success) {
        // Update local state for UI
        setTradeResult({
          amount: tradeAmount,
          profit,
          percentage: profitPercentage,
        });
        setTradeStatus("completed");

        // Show toast notification with profit info
        toast.success(`Trade completed! You earned ${formatCurrency(profit)}`);

        // Reset after 10 seconds
        setTimeout(() => {
          setTradeStatus("idle");
          setTradeResult(null);
        }, 10000);

        // Refresh user data after a small delay to ensure backend has processed the change
        setTimeout(() => {
          console.log("Refreshing user data...");
          fetchUserData();
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to complete trade");
      }
    } catch (error) {
      console.error("Error completing trade:", error);
      setTradeStatus("idle");
      toast.error("Error completing trade");

      // Fallback to local simulation
      simulateLocalTrade(tradeAmount);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate bot profit rate
  const getBotProfitRate = (): number => {
    if (!botType) return 10;

    switch (botType) {
      case BotType.BASIC:
        return 12;
      case BotType.ADVANCED:
        return 14;
      case BotType.PRO:
        return 15;
      default:
        return 10;
    }
  };

  return (
    <div>
      <div className="flex md:flex-row flex-col">
        <LeftBar />
        <TopBar />
        <div className="w-full relative">
          <div className="bg-[#171022] md:block hidden py-3 rounded-lg border-[#403257] px-5 text-end absolute top-3 border right-5 text-white">
            <span className="text-[#c4c4ca] text-sm">PKR </span>
            {formatCurrency(balance).replace("PKR", "")}
          </div>

          {tradeStatus === "processing" && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-[#171022] p-8 rounded-lg border border-[#403257] text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5f29b7] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Trade in Progress</h3>
              <p className="text-sm text-gray-400">
                Your trade of {formatCurrency(amount)} is being processed
              </p>
            </div>
          )}

          {tradeStatus === "completed" && tradeResult && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-[#171022] p-8 rounded-lg border border-[#403257] text-white text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-green-400">
                Trade Completed
              </h3>
              <div className="bg-[#201738] p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span>{formatCurrency(tradeResult.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Profit %:</span>
                  <span className="text-green-400">
                    {tradeResult.percentage}%
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Profit:</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(tradeResult.profit)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Profit added to your balance
              </p>
            </div>
          )}

          <TradingViewWidget />

          <BottomBar
            amount={amount}
            setAmount={setAmount}
            time={duration}
            setTime={setDuration}
            onStartTrade={handleStartTrade}
            isLoading={loading}
            botActive={activeSubscription}
            botType={botType}
            botProfitRate={getBotProfitRate()}
          />
        </div>
        <RightBar
          amount={amount}
          setAmount={setAmount}
          duration={duration}
          setDuration={setDuration}
          onStartTrade={handleStartTrade}
          isLoading={loading}
          botActive={activeSubscription}
          botType={botType}
          botProfitRate={getBotProfitRate()}
          balance={balance}
        />
      </div>
    </div>
  );
};

export default Platform;
