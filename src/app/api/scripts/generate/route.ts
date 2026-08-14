import { NextRequest, NextResponse } from "next/server";
import { generatePlaywrightScript } from "@/lib/ai-testing";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.testCase) throw new Error("testCase is required. Generate and select a test case first.");

    const { generatedScript, aiConversation } = await generatePlaywrightScript({
      analysis: body.analysis,
      testCase: body.testCase,
    });

    // Persist to DB if we have analysis context
    if (env.databaseUrl && body.repositoryId) {
      try {
        const [{ db }, schema] = await Promise.all([
          import("@/db"),
          import("@/db/schema"),
        ]);

        // Find the matching test case in DB (best-effort)
        const existing = await db
          .select({ id: schema.testCases.id })
          .from(schema.testCases)
          .where(eq(schema.testCases.title, body.testCase.title))
          .limit(1);

        if (existing.length > 0) {
          await db.insert(schema.testScripts).values({
            testCaseId: existing[0].id,
            framework: "playwright",
            script: generatedScript.script,
          });
        }
      } catch {
        // DB save is best-effort
      }
    }

    return NextResponse.json({ ok: true, generatedScript, aiConversation });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Script generation failed." },
      { status: 400 },
    );
  }
}