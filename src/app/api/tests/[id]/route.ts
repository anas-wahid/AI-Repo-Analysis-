import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!env.databaseUrl) {
      return NextResponse.json(
        { ok: false, error: "Database not configured." },
        { status: 500 }
      );
    }

    const [{ db }, schema] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.targetRoute !== undefined) updates.targetRoute = body.targetRoute;
    if (body.assertions !== undefined) {
      updates.sourceMetadata = { assertions: body.assertions };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields to update." },
        { status: 400 }
      );
    }

    await db
      .update(schema.testCases)
      .set(updates)
      .where(eq(schema.testCases.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to update test case.",
      },
      { status: 400 }
    );
  }
}
