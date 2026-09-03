import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    if (!env.databaseUrl) {
      return NextResponse.json(
        { ok: true, runs: [], message: "Database not configured." }
      );
    }

    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    const runs = await db
      .select({
        id: schema.testRuns.id,
        repositoryId: schema.testRuns.repositoryId,
        status: schema.testRuns.status,
        summary: schema.testRuns.summary,
        startedAt: schema.testRuns.startedAt,
        finishedAt: schema.testRuns.finishedAt,
        createdAt: schema.testRuns.createdAt,
        repoOwner: schema.repositories.githubOwner,
        repoName: schema.repositories.githubRepo,
        sessionLogsUrl: schema.browserSessions.logsUrl,
        sessionScreenshotUrl: schema.browserSessions.screenshotUrl,
      })
      .from(schema.testRuns)
      .leftJoin(
        schema.repositories,
        eq(schema.testRuns.repositoryId, schema.repositories.id),
      )
      .leftJoin(
        schema.browserSessions,
        eq(schema.testRuns.id, schema.browserSessions.testRunId),
      )
      .orderBy(desc(schema.testRuns.createdAt))
      .limit(50);

    const enrichedRuns = runs.map((run) => {
      const repoFullName = run.repoName
        ? `${run.repoOwner}/${run.repoName}`
        : "";
      const durationMs =
        run.startedAt && run.finishedAt
          ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
          : null;

      return {
        id: run.id,
        repoName: run.repoName || "Unknown",
        repoFullName,
        status: run.status,
        summary: run.summary,
        durationMs,
        startedAt: run.startedAt?.toISOString() ?? null,
        finishedAt: run.finishedAt?.toISOString() ?? null,
        createdAt: run.createdAt.toISOString(),
        sessionUrl: run.sessionLogsUrl ?? null,
        screenshotUrl: run.sessionScreenshotUrl ?? null,
      };
    });

    return NextResponse.json({ ok: true, runs: enrichedRuns });
  } catch (error) {
    return NextResponse.json(
      {
        ok: true,
        error: error instanceof Error ? error.message : "Failed to fetch runs.",
        runs: [],
      },
    );
  }
}
