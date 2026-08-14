import { NextResponse } from "next/server";
import { getMissingServerEnv } from "@/lib/env";

export async function GET() {
  const missing = getMissingServerEnv();

  return NextResponse.json({
    ok: missing.length === 0,
    service: "ai-testing-automation-agent",
    day: 5,
    layers: {
      nextjs: true,
      neon: missing.includes("DATABASE_URL") ? "not_configured" : "configured",
      drizzle: true,
      github: true,
      ai: process.env.OPENAI_API_KEY ? "configured" : "fallback_enabled",
      playwright: true,
      browserbase: process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID ? "configured" : "credentials_required",
    },
    missingEnv: missing,
  });
}