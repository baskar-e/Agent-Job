/**
 * Standalone CLI runner — used by GitHub Actions cron and `npm run agent`
 * tsx src/agent/run.ts
 */

import { runAgent } from "@/lib/agent";
import { sendTelegramStartup } from "@/lib/telegram";
import { FEEDS } from "@/lib/config";

const required = ["GROQ_API_KEY", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"];

function validateEnv(): void {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(", ")}`);
    console.error("Copy .env.example → .env and fill in your values.");
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log("🤖 Frontend Job Alert Agent (Next.js + TypeScript)");
  console.log("════════════════════════════════════════════════════");

  validateEnv();

  // Send startup Telegram message on first run
  if (process.argv.includes("--startup")) {
    await sendTelegramStartup(FEEDS.length);
  }

  const result = await runAgent();

  console.log("\n📊 Run Summary:");
  console.log(`   Ran at:       ${result.ranAt}`);
  console.log(`   Total fetched: ${result.totalFetched}`);
  console.log(`   Alerts sent:   ${result.alertsSent}`);

  if (result.jobs.length > 0) {
    console.log("\n🎯 Alerted jobs:");
    result.jobs.forEach((j) => {
      console.log(`   ${j.score}/10 — ${j.title} (${j.feedName})`);
    });
  }
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
