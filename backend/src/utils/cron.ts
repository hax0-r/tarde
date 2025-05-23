import cron from "node-cron";
import Trade, { TradeStatus } from "../models/Trade";
import User from "../models/User";
import BotSubscription from "../models/BotSubscription";

// Function to complete expired trades
const completeTrades = async (): Promise<void> => {
  try {
    console.log("Running completeTrades cron job...");

    // Find all active trades that have reached their end date
    const now = new Date();
    const expiredTrades = await Trade.find({
      status: TradeStatus.ACTIVE,
      endDate: { $lte: now },
    });

    console.log(`Found ${expiredTrades.length} expired trades to complete`);

    // Process each expired trade
    for (const trade of expiredTrades) {
      try {
        // Find the user
        const user = await User.findById(trade.userId);

        if (!user) {
          console.error(`User not found for trade ${trade._id}`);
          continue;
        }

        // Update trade status
        trade.status = TradeStatus.COMPLETED;
        await trade.save();

        // Add profit to user's balance and total profit
        user.balance += trade.amount + trade.profitAmount;
        user.totalProfit += trade.profitAmount;
        await user.save();

        console.log(
          `Completed trade ${trade._id} for user ${user._id}, profit: ${trade.profitAmount}`
        );
      } catch (error) {
        console.error(`Error processing trade ${trade._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in completeTrades cron job:", error);
  }
};

// Function to deactivate expired bot subscriptions
const deactivateExpiredBotSubscriptions = async (): Promise<void> => {
  try {
    console.log("Running deactivateExpiredBotSubscriptions cron job...");

    // Find all active bot subscriptions that have reached their end date
    const now = new Date();
    const expiredSubscriptions = await BotSubscription.find({
      isActive: true,
      endDate: { $lte: now },
    });

    console.log(
      `Found ${expiredSubscriptions.length} expired bot subscriptions to deactivate`
    );

    // Deactivate each expired subscription
    for (const subscription of expiredSubscriptions) {
      try {
        subscription.isActive = false;
        await subscription.save();

        console.log(
          `Deactivated bot subscription ${subscription._id} for user ${subscription.userId}`
        );
      } catch (error) {
        console.error(
          `Error deactivating subscription ${subscription._id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      "Error in deactivateExpiredBotSubscriptions cron job:",
      error
    );
  }
};

// Schedule cron jobs to run every hour
export const scheduleCronJobs = (): void => {
  // Complete expired trades (runs every hour)
  cron.schedule("0 * * * *", completeTrades);

  // Deactivate expired bot subscriptions (runs every hour)
  cron.schedule("0 * * * *", deactivateExpiredBotSubscriptions);

  console.log("Cron jobs scheduled");
};

// Export functions for testing
export { completeTrades, deactivateExpiredBotSubscriptions };
