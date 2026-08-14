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
      })
      .from(schema.testRuns)
      .orderBy(desc(schema.testRuns.createdAt))
      .limit(50);

    // Enrich with repository names and browser session data
    const enrichedRuns = await Promise.all(
      runs.map(async (run) => {
        let repoName = "Unknown";
        let repoFullName = "";
        try {
          const [repo] = await db
            .select({
              owner: schema.repositories.githubOwner,
              name: schema.repositories.githubRepo,
            })
            .from(schema.repositories)
            .where(eq(schema.repositories.id, run.repositoryId))
            .limit(1);
          if (repo) {
            repoName = repo.name;
            repoFullName = `${repo.owner}/${repo.name}`;
          }
        } catch {
          // ignore
        }

        let sessionUrl: string | null = null;
        let screenshotUrl: string | null = null;
        try {
          const [session] = await db
            .select({
              logsUrl: schema.browserSessions.logsUrl,
              screenshotUrl: schema.browserSessions.screenshotUrl,
            })
            .from(schema.browserSessions)
            .where(eq(schema.browserSessions.testRunId, run.id))
            .limit(1);
          if (session) {
            sessionUrl = session.logsUrl;
            screenshotUrl = session.screenshotUrl;
          }
        } catch {
          // ignore
        }

        const durationMs =
          run.startedAt && run.finishedAt
            ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
            : null;

        return {
          id: run.id,
          repoName,
          repoFullName,
          status: run.status,
          summary: run.summary,
          durationMs,
          startedAt: run.startedAt?.toISOString() ?? null,
          finishedAt: run.finishedAt?.toISOString() ?? null,
          createdAt: run.createdAt.toISOString(),
          sessionUrl,
          screenshotUrl,
        };
      })
    );

    return NextResponse.json({ ok: true, runs: enrichedRuns });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch runs.",
        runs: [],
      },
      { status: 500 }
    );
  }
}
