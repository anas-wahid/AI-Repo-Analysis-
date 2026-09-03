import { NextRequest, NextResponse } from "next/server";
import { runBrowserSession } from "@/lib/browserbase";
import { explainTestFailure } from "@/lib/ai-error-explainer";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.generatedScript) {
      throw new Error("generatedScript is required. Generate a script first.");
    }

    const targetBaseUrl =
      body.targetBaseUrl || env.targetBaseUrl || "http://localhost:3000";

    const steps = Array.isArray(body.generatedScript.steps)
      ? body.generatedScript.steps.slice(0, 20)
      : [];

    const validActions = new Set(["goto", "click", "fill", "expectVisible", "expectText", "screenshot"]);
    const sanitizedSteps = steps.filter(
      (step: { action?: string }) => step && typeof step.action === "string" && validActions.has(step.action),
    );

    const testTitle: string = body.generatedScript.title || "Browser Test";

    // ── Run the browser session ────────────────────────────────
    const result = await runBrowserSession({
      steps: sanitizedSteps,
      targetBaseUrl,
      testTitle,
      browserbaseApiKey: env.browserbaseApiKey || undefined,
      browserbaseProjectId: env.browserbaseProjectId || undefined,
    });

    // ── AI Error Explanation (only on failure) ─────────────────
    let aiErrorExplanation = null;
    const aiConversation: unknown[] = [];
    if (result.status === "error" && result.failingStep) {
      try {
        const explainResult = await explainTestFailure({
          failingStep: result.failingStep,
          errorMessage: result.errorMessage || result.summary,
          targetUrl: targetBaseUrl,
          logs: result.logs,
          testTitle,
        });
        aiErrorExplanation = explainResult.explanation;
        aiConversation.push(...explainResult.aiConversation);
      } catch {
        // non-critical — just skip if AI explanation fails
      }
    }

    // ── Persist to DB if available ─────────────────────────────
    if (env.databaseUrl && body.repositoryId) {
      try {
        const [{ db }, schema] = await Promise.all([
          import("@/db"),
          import("@/db/schema"),
        ]);

        const [testRun] = await db
          .insert(schema.testRuns)
          .values({
            repositoryId: body.repositoryId,
            status:
              result.status === "passed"
                ? "passed"
                : result.status === "error"
                ? "failed"
                : "cancelled",
            summary: result.summary,
            startedAt: new Date(Date.now() - result.durationMs),
            finishedAt: new Date(),
          })
          .returning({ id: schema.testRuns.id });

        if (result.sessionUrl || result.screenshotBase64 || result.failureScreenshotBase64) {
          await db.insert(schema.browserSessions).values({
            testRunId: testRun.id,
            provider: result.sessionUrl ? "browserbase" : "local",
            providerSessionId: result.sessionUrl?.split("/").pop() || null,
            status: result.status === "passed" ? "passed" : "failed",
            logsUrl: result.sessionUrl || null,
            screenshotUrl: (result.failureScreenshotBase64 || result.screenshotBase64)
              ? `data:image/png;base64,${result.failureScreenshotBase64 || result.screenshotBase64}`
              : null,
          });
        }

        result.logs.push("Run result saved to database.");
      } catch (dbErr) {
        result.logs.push(
          `DB save skipped: ${dbErr instanceof Error ? dbErr.message : "unknown error"}`,
        );
      }
    }

    // ── Return full result ─────────────────────────────────────
    return NextResponse.json({
      ok: true,
      result: {
        status: result.status,
        summary: result.summary,
        logs: result.logs,
        screenshotBase64: result.screenshotBase64,
        failureScreenshotBase64: result.failureScreenshotBase64,
        videoBase64: result.videoBase64,
        videoName: result.videoName,
        sessionUrl: result.sessionUrl,
        durationMs: result.durationMs,
        stepResults: result.stepResults,
        aiErrorExplanation,
      },
      aiConversation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Test run failed.",
      },
      { status: 400 },
    );
  }
}