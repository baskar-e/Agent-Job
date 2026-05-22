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

// ─── JSearch Types ────────────────────────────────────────────────────────────
 
export interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_apply_link: string;
  job_description: string;
  job_city?: string;
  job_country?: string;
  job_posted_at_datetime_utc?: string;
  job_employment_type?: string;
  job_is_remote?: boolean;
  job_salary_currency?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_required_skills?: string[];
  employer_logo?: string;
}
 
export interface JSearchResponse {
  status: string;
  data: JSearchJob[];
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
