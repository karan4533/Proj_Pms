/**
 * Cron Job Service - Auto End Shifts at 11:59 PM
 * 
 * This service runs every minute and checks if it's 11:59 PM.
 * If so, it automatically ends all active attendance shifts.
 */

import { autoEndExpiredShifts } from "@/features/attendance/utils/auto-end-shifts";

let isRunning = false;
let cronInterval: NodeJS.Timeout | null = null;

/**
 * Check if current time is 11:59 PM
 */
function isEndOfDay(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Check if it's 11:59 PM (23:59)
  return hours === 23 && minutes === 59;
}

/**
 * Main cron job function - runs every minute
 */
async function runCronJob() {
  if (isRunning) {
    console.log("⏭️  Cron job already running, skipping...");
    return;
  }

  try {
    isRunning = true;
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    // Check if it's 11:59 PM
    if (isEndOfDay()) {
      console.log(`\n🕐 [${timeStr}] Auto-end shifts triggered at 11:59 PM`);
      console.log("=" + "=".repeat(60));
      
      const result = await autoEndExpiredShifts();
      
      if (result.success) {
        console.log(`✅ Auto-ended ${result.autoEndedCount} active shift(s)`);
        console.log(`📅 Timestamp: ${result.timestamp}`);
      } else {
        console.error(`❌ Error auto-ending shifts: ${result.error}`);
      }
      
      console.log("=" + "=".repeat(60) + "\n");
    }
  } catch (error) {
    console.error("❌ Cron job error:", error);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the cron job service
 */
export function startCronService() {
  if (cronInterval) {
    console.log("⚠️  Cron service already running");
    return;
  }

  console.log("\n🚀 Starting Auto End-Shift Cron Service");
  console.log("⏰ Schedule: Every minute, auto-end at 11:59 PM");
  console.log("=" + "=".repeat(60) + "\n");

  // Run immediately on startup (if it's 11:59 PM)
  runCronJob();

  // Then run every minute
  cronInterval = setInterval(runCronJob, 60 * 1000); // Every 60 seconds

  // Handle process termination
  process.on('SIGTERM', stopCronService);
  process.on('SIGINT', stopCronService);
}

/**
 * Stop the cron job service
 */
export function stopCronService() {
  if (cronInterval) {
    console.log("\n🛑 Stopping Auto End-Shift Cron Service");
    clearInterval(cronInterval);
    cronInterval = null;
  }
}

/**
 * Get cron service status
 */
export function getCronStatus() {
  return {
    isRunning: cronInterval !== null,
    nextCheck: cronInterval ? new Date(Date.now() + 60000).toISOString() : null,
  };
}
