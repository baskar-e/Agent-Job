import Groq from "groq-sdk";
import type { RawJob, ScoreResult } from "@/types";
import { YOUR_PROFILE } from "@/lib/config";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function scoreJob(
  job: RawJob & { feedName: string }
): Promise<ScoreResult> {
  try {
    const groq = getGroq();
    const snippet = (job.contentSnippet ?? job.content ?? "").slice(0, 400);

    const prompt = `You are a job relevance scorer. Score this job listing for the candidate below.

Candidate profile:
${YOUR_PROFILE}

Job title: ${job.title ?? "Unknown"}
Job source: ${job.feedName}
Description: ${snippet}

Respond ONLY with valid JSON — no markdown, no explanation:
{"score": 8, "reason": "Short one-sentence reason"}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.1,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as ScoreResult;
    return parsed;
  } catch (err) {
    console.error("  [scoreJob] Error:", (err as Error).message);
    return { score: 0, reason: "Scoring failed" };
  }
}
