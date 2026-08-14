import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

type RouteContext = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { owner, repo } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value || env.githubToken;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated.", branches: [] },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "ai-testing-automation-agent",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `GitHub API error: ${res.status}`, branches: [] },
        { status: res.status },
      );
    }

    const data = (await res.json()) as Array<{ name: string; protected: boolean }>;

    return NextResponse.json({
      ok: true,
      branches: data.map((b) => ({ name: b.name, protected: b.protected })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch branches",
        branches: [],
      },
      { status: 500 },
    );
  }
}
