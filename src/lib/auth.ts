import { env } from "@/lib/env";

const DEV_USER_EMAIL = "local-dev@ai-testing-agent.test";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Get or create the dev user.
 * In production this would be replaced with real OAuth / session logic.
 */
export async function getOrCreateUser(): Promise<AuthUser | null> {
  if (!env.databaseUrl) return null;

  try {
    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    const [user] = await db
      .insert(schema.users)
      .values({
        email: DEV_USER_EMAIL,
        name: "Local Developer",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { updatedAt: new Date() },
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
      });

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? "Developer",
    };
  } catch {
    return null;
  }
}
