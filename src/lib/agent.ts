import RSSParser from "rss-parser";
import type { RawJob, ScoredJob, AgentRunResult } from "@/types";
import { FEEDS, MIN_SCORE } from "@/lib/config";
import { getSeenIds, saveSeenIds, addSeen } from "@/lib/seen";
import { scoreJob } from "@/lib/scorer";
import { sendTelegramAlert } from "@/lib/telegram";

const parser = new RSSParser();

function extractId(item: RawJob): string {
  return item.guid ?? item.link ?? item.title ?? Math.random().toString();
}

function extractCompany(item: RawJob, feedName: string): string {
  return item.creator ?? feedName;
}

export async function runAgent(): Promise<AgentRunResult> {
  const ranAt = new Date().toISOString();
  console.log(`\n[${ranAt}] 🔍 Running job agent...`);

  let seenIds = getSeenIds();
  let totalFetched = 0;
  let alertsSent = 0;
  const alertedJobs: ScoredJob[] = [];

  for (const feed of FEEDS) {
    console.log(`\n  📡 Fetching: ${feed.name}`);

    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items as RawJob[]).slice(0, 15);
      totalFetched += items.length;

      for (const item of items) {
        const id = extractId(item);

        if (seenIds.includes(id)) continue;
        seenIds = addSeen(seenIds, id);

        const jobWithFeed = { ...item, feedName: feed.name };
        const { score, reason } = await scoreJob(jobWithFeed);

        const indicator = score >= MIN_SCORE ? "✅" : "⬜";
        console.log(
          `  ${indicator} ${score}/10 — ${(item.title ?? "Untitled").slice(0, 60)}`
        );

        if (score >= MIN_SCORE) {
          const scoredJob: ScoredJob = {
            id,
            title: item.title ?? "Untitled",
            company: extractCompany(item, feed.name),
            link: item.link ?? "#",
            feedName: feed.name,
            snippet: (item.contentSnippet ?? "").slice(0, 200),
            score,
            reason,
            pubDate: item.isoDate ?? item.pubDate ?? ranAt,
            alertedAt: ranAt,
          };

          try {
            await sendTelegramAlert(scoredJob);
            alertedJobs.push(scoredJob);
            alertsSent++;
          } catch (err) {
            console.error("  ❌ Telegram send failed:", (err as Error).message);
          }

          // Avoid Telegram rate limits
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    } catch (err) {
      console.error(
        `  ❌ Feed error (${feed.name}):`,
        (err as Error).message
      );
    }
  }

  saveSeenIds(seenIds);
  console.log(
    `\n✅ Done. Fetched ${totalFetched} jobs. Sent ${alertsSent} alerts.`
  );

  return { ranAt, totalFetched, alertsSent, jobs: alertedJobs };
}
