import { NextRequest, NextResponse } from "next/server";
import { generateTestCases } from "@/lib/ai-testing";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.analysis) throw new Error("analysis is required. Add a repo first.");
    const { testCases, aiConversation } = await generateTestCases(body.analysis);

    // Persist to DB if repositoryId is available
    if (env.databaseUrl && body.repositoryId) {
      try {
        const [{ db }, schema] = await Promise.all([
          import("@/db"),
          import("@/db/schema"),
        ]);

        await db.insert(schema.testCases).values(
          testCases.map((tc) => ({
            repositoryId: body.repositoryId,
            title: tc.title,
            description: tc.description,
            priority: tc.priority,
            targetRoute: tc.targetRoute,
            generatedByAi: true,
            sourceMetadata: { assertions: tc.assertions },
          })),
        );
      } catch {
        // DB save is best-effort — don't fail the request
      }
    }

    return NextResponse.json({ ok: true, testCases, aiConversation });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Test generation failed." },
      { status: 400 },
    );
  }
}