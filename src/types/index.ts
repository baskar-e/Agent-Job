// ─── Job Types ──────────────────────────────────────────────────────────────

export interface RawJob {
  guid?: string;
  link?: string;
  title?: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  pubDate?: string;
  isoDate?: string;
}

export interface ScoredJob {
  id: string;
  title: string;
  company: string;
  link: string;
  feedName: string;
  snippet: string;
  score: number;
  reason: string;
  pubDate: string;
  alertedAt: string;
}

export interface ScoreResult {
  score: number;
  reason: string;
}

// ─── Feed Config ─────────────────────────────────────────────────────────────

export interface FeedConfig {
  name: string;
  url: string;
}

// ─── Agent Run Result ────────────────────────────────────────────────────────

export interface AgentRunResult {
  ranAt: string;
  totalFetched: number;
  alertsSent: number;
  jobs: ScoredJob[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
