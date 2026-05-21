import fs from "fs";
import path from "path";

const SEEN_FILE = path.join(process.cwd(), "seen_jobs.json");
const MAX_SEEN = 1000;

export function getSeenIds(): string[] {
  try {
    const raw = fs.readFileSync(SEEN_FILE, "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveSeenIds(ids: string[]): void {
  // Trim to last MAX_SEEN to avoid unbounded growth
  const trimmed = ids.slice(-MAX_SEEN);
  fs.writeFileSync(SEEN_FILE, JSON.stringify(trimmed), "utf-8");
}

export function addSeen(existing: string[], newId: string): string[] {
  if (existing.includes(newId)) return existing;
  return [...existing, newId];
}
