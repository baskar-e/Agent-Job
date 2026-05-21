"use client";

import { useState, useCallback } from "react";
import {
  Zap,
  RefreshCw,
  Briefcase,
  Send,
  Globe,
  MapPin,
  Star,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { ScoredJob, AgentRunResult } from "@/types";
import styles from "./dashboard.module.css";

// ── Mock jobs shown in the UI before first agent run ────────────────────────
const MOCK_JOBS: ScoredJob[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer (React + TypeScript)",
    company: "Nango",
    feedName: "RemoteOK",
    link: "https://remoteok.com",
    snippet: "Looking for a mid-senior frontend engineer with strong React and TypeScript skills. Remote-first team, competitive salary.",
    score: 9,
    reason: "Excellent React/TypeScript match, remote-friendly, mid-senior level",
    pubDate: new Date().toISOString(),
    alertedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Frontend Developer (React / Next.js)",
    company: "Startup India",
    feedName: "WeWorkRemotely",
    link: "https://weworkremotely.com",
    snippet: "We are building the next generation of developer tools. Looking for a passionate frontend developer comfortable in React.",
    score: 8,
    reason: "Strong Next.js + React match, remote role fits preferences",
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    alertedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    title: "Mid-level React Developer",
    company: "HealthTech Co.",
    feedName: "Remotive",
    link: "https://remotive.com",
    snippet: "Building healthcare infrastructure. Need a React developer to own our patient-facing dashboard.",
    score: 7,
    reason: "Good React fit, healthcare domain is interesting for growth",
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    alertedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

type Filter = "all" | "remote" | "india" | "startup";
type Status = "idle" | "running" | "success" | "error";

function scoreColor(score: number): string {
  if (score >= 8) return "var(--green)";
  if (score >= 6) return "var(--amber)";
  return "var(--red)";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── JobCard ──────────────────────────────────────────────────────────────────
function JobCard({ job }: { job: ScoredJob }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <h3 className={styles.cardTitle}>{job.title}</h3>
          <p className={styles.cardCompany}>{job.company}</p>
        </div>
        <div
          className={styles.scoreBadge}
          style={{ color: scoreColor(job.score) }}
        >
          <Star size={12} fill={scoreColor(job.score)} />
          <span>{job.score}/10</span>
        </div>
      </div>

      <p className={styles.cardSnippet}>{job.snippet}</p>

      <p className={styles.cardReason}>💡 {job.reason}</p>

      <div className={styles.cardFooter}>
        <div className={styles.cardTags}>
          <span className={styles.tag}>
            <Globe size={11} />
            {job.feedName}
          </span>
          <span className={styles.tag}>
            <Clock size={11} />
            {timeAgo(job.alertedAt)}
          </span>
        </div>
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewBtn}
        >
          View job <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [jobs, setJobs] = useState<ScoredJob[]>(MOCK_JOBS);
  const [status, setStatus] = useState<Status>("idle");
  const [lastRun, setLastRun] = useState<AgentRunResult | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const triggerAgent = useCallback(async () => {
    setStatus("running");
    setErrorMsg("");

    try {
      const res = await fetch("/api/agent/run", { method: "POST" });
      const data = (await res.json()) as {
        success: boolean;
        data?: AgentRunResult;
        error?: string;
      };

      if (!data.success) throw new Error(data.error ?? "Agent failed");

      setLastRun(data.data ?? null);
      if (data.data?.jobs.length) {
        setJobs((prev) => {
          const newIds = new Set(data.data!.jobs.map((j) => j.id));
          const merged = [
            ...data.data!.jobs,
            ...prev.filter((j) => !newIds.has(j.id)),
          ];
          return merged.slice(0, 50);
        });
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus("error");
    }
  }, []);

  const filteredJobs = jobs.filter((j) => {
    if (filter === "all") return true;
    if (filter === "remote") return j.feedName !== "HN Who's Hiring";
    if (filter === "india") return j.company.toLowerCase().includes("india");
    if (filter === "startup") return j.score >= 8;
    return true;
  });

  return (
    <div className={styles.root}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Zap size={20} fill="var(--accent)" color="var(--accent)" />
          <span>JobRadar</span>
        </div>

        <nav className={styles.nav}>
          {(["all", "remote", "india", "startup"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`${styles.navItem} ${filter === f ? styles.navActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" && <Briefcase size={15} />}
              {f === "remote" && <Globe size={15} />}
              {f === "india" && <MapPin size={15} />}
              {f === "startup" && <Star size={15} />}
              <span>
                {f === "all"
                  ? "All Jobs"
                  : f === "remote"
                    ? "Remote"
                    : f === "india"
                      ? "India"
                      : "Top Rated"}
              </span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{jobs.length}</span>
              <span className={styles.statLabel}>Jobs found</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {jobs.filter((j) => j.score >= 8).length}
              </span>
              <span className={styles.statLabel}>Top rated</span>
            </div>
          </div>

          {lastRun && (
            <div className={styles.lastRun}>
              <Clock size={12} />
              <span>Last scan: {timeAgo(lastRun.ranAt)}</span>
            </div>
          )}

          <p className={styles.profileLabel}>Your profile</p>
          <div className={styles.profileCard}>
            <p>3 yrs · Frontend</p>
            <p>React · TypeScript</p>
            <p>Remote · India</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>
              Frontend Jobs
              <span className={styles.headingCount}>{filteredJobs.length}</span>
            </h1>
            <p className={styles.subheading}>
              AI-scored · Telegram alerts · Updated hourly
            </p>
          </div>

          <div className={styles.headerActions}>
            {status === "success" && lastRun && (
              <div className={styles.successBadge}>
                <CheckCircle size={14} />
                {lastRun.alertsSent} alerts sent
              </div>
            )}
            {status === "error" && (
              <div className={styles.errorBadge}>
                <AlertCircle size={14} />
                {errorMsg || "Agent error"}
              </div>
            )}
            <button
              className={styles.runBtn}
              onClick={triggerAgent}
              disabled={status === "running"}
            >
              {status === "running" ? (
                <>
                  <RefreshCw size={15} className={styles.spin} />
                  Scanning…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Run now
                </>
              )}
            </button>
          </div>
        </header>

        {/* Job grid */}
        {filteredJobs.length === 0 ? (
          <div className={styles.empty}>
            <Briefcase size={40} color="var(--text-dim)" />
            <p>No jobs yet. Run the agent to start scanning.</p>
            <button className={styles.runBtn} onClick={triggerAgent}>
              <Send size={15} /> Run agent
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
