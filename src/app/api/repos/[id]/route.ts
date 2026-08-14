import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!env.databaseUrl) {
      return NextResponse.json(
        { ok: false, error: "Database is not configured." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.selectedBranch === "string") updates.selectedBranch = body.selectedBranch;
    if (typeof body.githubOwner === "string") updates.githubOwner = body.githubOwner;
    if (typeof body.githubRepo === "string") updates.githubRepo = body.githubRepo;

    const [updated] = await db
      .update(schema.repositories)
      .set(updates)
      .where(eq(schema.repositories.id, id))
      .returning({ id: schema.repositories.id });

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Repository not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, repository: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!env.databaseUrl) {
      return NextResponse.json(
        { ok: false, error: "Database is not configured." },
        { status: 400 },
      );
    }

    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    const [deleted] = await db
      .delete(schema.repositories)
      .where(eq(schema.repositories.id, id))
      .returning({ id: schema.repositories.id });

    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Repository not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deleted: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Delete failed." },
      { status: 400 },
    );
  }
}
