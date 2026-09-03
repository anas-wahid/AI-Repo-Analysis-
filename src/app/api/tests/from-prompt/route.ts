import { NextRequest, NextResponse } from "next/server";
import { generateTestFromPrompt } from "@/lib/ai-testing";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt?.trim();
    if (!prompt || typeof body.prompt !== "string" || prompt.length < 5) {
      throw new Error("Please provide a test description (at least 5 characters).");
    }
    if (prompt.length > 2000) {
      throw new Error("Test description must be 2000 characters or fewer.");
    }

    const { testCase, aiConversation } = await generateTestFromPrompt({
      prompt,
      analysis: body.analysis ?? undefined,
    });

    // Persist to DB if repositoryId is available
    if (env.databaseUrl && body.repositoryId) {
      try {
        const [{ db }, schema] = await Promise.all([
          import("@/db"),
          import("@/db/schema"),
        ]);

        const [inserted] = await db.insert(schema.testCases).values({
          repositoryId: body.repositoryId,
          title: testCase.title,
          description: testCase.description,
          priority: testCase.priority,
          targetRoute: testCase.targetRoute,
          generatedByAi: true,
          sourceMetadata: {
            assertions: testCase.assertions,
            fromNaturalLanguage: true,
            originalPrompt: prompt,
          },
        }).returning({ id: schema.testCases.id });

        if (inserted) {
          testCase.databaseId = inserted.id;
        }
      } catch {
        // DB save is best-effort
      }
    }

    return NextResponse.json({ ok: true, testCase, aiConversation });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create test from prompt.",
      },
      { status: 400 }
    );
  }
}
