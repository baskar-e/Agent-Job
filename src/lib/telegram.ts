import type { ScoredJob } from "@/types";

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

function buildMessage(job: ScoredJob): string {
  const stars = "⭐".repeat(Math.min(Math.round(job.score / 2), 5));
  return `
🚀 *New Frontend Job Alert\\!*

*${escapeMarkdown(job.title)}*
🏢 Source: ${escapeMarkdown(job.feedName)}
${stars} Score: *${job.score}/10*
💡 ${escapeMarkdown(job.reason)}

🔗 [View Job](${job.link})
  `.trim();
}

export async function sendTelegramAlert(job: ScoredJob): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessage(job),
      parse_mode: "MarkdownV2",
      disable_web_page_preview: false,
    }),
  });

  const data = (await res.json()) as { ok: boolean; description?: string };
  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description}`);
  }
}

export async function sendTelegramStartup(feedCount: number): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ *Job Alert Agent Started\\!*\n\nScanning ${feedCount} job boards every hour\\. I'll alert you when relevant frontend roles appear\\.`,
      parse_mode: "MarkdownV2",
    }),
  });
}
