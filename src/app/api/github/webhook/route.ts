import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split("=");
  if (parts.length !== 2) return false;

  const [algo, signature] = parts;
  if (algo !== "sha256") return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(digest, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  const signatureHeader = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const event = request.headers.get("x-github-event") || "unknown";

  if (event !== "pull_request") {
    return NextResponse.json({
      ok: true,
      ignored: true,
      message: `Ignoring GitHub event: ${event}`,
    });
  }

  const action = payload.action;
  const repository = (payload.repository as Record<string, unknown>)?.full_name;
  const pullRequest = (payload.pull_request as Record<string, unknown>)?.number;

  return NextResponse.json({
    ok: true,
    queued: action === "opened" || action === "synchronize" || action === "reopened",
    message: "GitHub PR webhook received. Queue-backed PR review can be connected here.",
    repository,
    pullRequest,
    action,
  });
}
