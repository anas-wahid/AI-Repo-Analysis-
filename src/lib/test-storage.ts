import { env } from "@/lib/env";
import type { GeneratedScript, TestCase } from "@/lib/ai-testing";

export async function saveGeneratedTestCases(repositoryId: string | undefined, testCases: TestCase[]) {
  if (!env.databaseUrl || !repositoryId) {
    return { saved: false, message: "DATABASE_URL or repositoryId missing; test cases kept in UI only.", testCases };
  }

  try {
    const [{ db }, schema] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const rows = await db.insert(schema.testCases).values(
      testCases.map((testCase) => ({
        repositoryId,
        title: testCase.title,
        description: testCase.description,
        priority: testCase.priority,
        targetRoute: testCase.targetRoute,
        sourceMetadata: { assertions: testCase.assertions },
      })),
    ).returning({ id: schema.testCases.id, title: schema.testCases.title });

    return {
      saved: true,
      message: "Test cases saved to Neon.",
      testCases: testCases.map((testCase) => ({
        ...testCase,
        databaseId: rows.find((row) => row.title === testCase.title)?.id,
      })),
    };
  } catch (error) {
    return {
      saved: false,
      message: error instanceof Error ? error.message : "Could not save test cases.",
      testCases,
    };
  }
}

export async function saveGeneratedScript(testCaseId: string | undefined, generatedScript: GeneratedScript) {
  if (!env.databaseUrl || !testCaseId || !isUuid(testCaseId)) {
    return { saved: false, message: "No persisted testCaseId; script kept in UI only." };
  }

  try {
    const [{ db }, schema] = await Promise.all([import("@/db"), import("@/db/schema")]);
    await db.insert(schema.testScripts).values({
      testCaseId,
      framework: generatedScript.framework,
      script: `${generatedScript.script}\n\n/* steps\n${JSON.stringify(generatedScript.steps, null, 2)}\n*/`,
      approved: true,
    });
    return { saved: true, message: "Generated script saved to Neon." };
  } catch (error) {
    return { saved: false, message: error instanceof Error ? error.message : "Could not save generated script." };
  }
}

export async function saveBrowserRun(input: {
  repositoryId?: string;
  status: "passed" | "failed" | "skipped" | "queued";
  summary: string;
  logs: string[];
  sessionId?: string;
  liveUrl?: string;
}) {
  if (!env.databaseUrl || !input.repositoryId) {
    return { saved: false, message: "DATABASE_URL or repositoryId missing; run kept in UI only." };
  }

  try {
    const [{ db }, schema] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const [run] = await db.insert(schema.testRuns).values({
      repositoryId: input.repositoryId,
      status: input.status === "passed" ? "passed" : input.status === "failed" ? "failed" : "cancelled",
      summary: `${input.summary}\n\n${input.logs.join("\n")}`,
      startedAt: new Date(),
      finishedAt: new Date(),
    }).returning({ id: schema.testRuns.id });

    if (input.sessionId) {
      await db.insert(schema.browserSessions).values({
        testRunId: run.id,
        providerSessionId: input.sessionId,
        status: input.status === "passed" ? "passed" : input.status === "failed" ? "failed" : "cancelled",
        logsUrl: input.liveUrl,
      });
    }

    return { saved: true, message: "Browser run saved to Neon." };
  } catch (error) {
    return { saved: false, message: error instanceof Error ? error.message : "Could not save browser run." };
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}