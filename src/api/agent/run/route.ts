import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import type { AgentRunResult, ApiResponse } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — enough for all feeds + scoring

export async function POST(request: Request): Promise<NextResponse> {
  // Simple secret-based auth for the trigger endpoint
  const authHeader = request.headers.get("authorization");
  const secret = process.env.AGENT_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result: AgentRunResult = await runAgent();
    return NextResponse.json<ApiResponse<AgentRunResult>>({
      success: true,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET returns last run info if available
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      message: "Job Alert Agent API. POST to /api/agent/run to trigger a scan.",
      endpoints: {
        "POST /api/agent/run": "Trigger an agent run",
        "GET /api/jobs": "Fetch recently alerted jobs",
      },
    },
  });
}
