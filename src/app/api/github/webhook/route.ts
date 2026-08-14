import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const event = request.headers.get("x-github-event") || "unknown";
  const payload = await request.json().catch(() => ({}));

  if (event !== "pull_request") {
    return NextResponse.json({
      ok: true,
      ignored: true,
      message: `Ignoring GitHub event: ${event}`,
    });
  }

  const action = payload.action;
  const repository = payload.repository?.full_name;
  const pullRequest = payload.pull_request?.number;

  return NextResponse.json({
    ok: true,
    queued: action === "opened" || action === "synchronize" || action === "reopened",
    message: "GitHub PR webhook received. Queue-backed PR review can be connected here.",
    repository,
    pullRequest,
    action,
  });
}