import { desc } from "drizzle-orm";
import type { RepositoryAnalysis } from "@/lib/github";
import { env } from "@/lib/env";

const DEV_USER_EMAIL = "local-dev@ai-testing-agent.test";

export async function persistRepositoryAnalysis(analysis: RepositoryAnalysis) {
  if (!env.databaseUrl) {
    return {
      enabled: false,
      saved: false,
      message: "DATABASE_URL is not configured, so Day 2 analysis was not saved.",
    };
  }

  try {
    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    const [user] = await db
      .insert(schema.users)
      .values({
        email: DEV_USER_EMAIL,
        name: "Local Development User",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { updatedAt: new Date() },
      })
      .returning({ id: schema.users.id });

    const [repository] = await db
      .insert(schema.repositories)
      .values({
        userId: user.id,
        githubOwner: analysis.repository.owner,
        githubRepo: analysis.repository.name,
        defaultBranch: analysis.repository.defaultBranch,
        selectedBranch: analysis.repository.selectedBranch,
      })
      .returning({ id: schema.repositories.id });

    if (analysis.selectedFiles.length > 0) {
      await db.insert(schema.repositoryFiles).values(
        analysis.selectedFiles.slice(0, 40).map((file) => ({
          repositoryId: repository.id,
          path: file.path,
          language: file.language,
          sizeBytes: file.sizeBytes,
          selectedForAnalysis: true,
        })),
      );
    }

    return {
      enabled: true,
      saved: true,
      repositoryId: repository.id,
      message: "Repository analysis saved to Neon.",
    };
  } catch (error) {
    return {
      enabled: true,
      saved: false,
      message:
        error instanceof Error
          ? `Database save skipped: ${error.message}`
          : "Database save skipped due to an unknown error.",
    };
  }
}

export async function listRecentRepositories() {
  if (!env.databaseUrl) return [];

  try {
    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    return db
      .select({
        id: schema.repositories.id,
        githubOwner: schema.repositories.githubOwner,
        githubRepo: schema.repositories.githubRepo,
        selectedBranch: schema.repositories.selectedBranch,
        createdAt: schema.repositories.createdAt,
      })
      .from(schema.repositories)
      .orderBy(desc(schema.repositories.createdAt))
      .limit(8);
  } catch {
    return [];
  }
}