import { NextRequest, NextResponse } from "next/server";
import { analyzeGitHubRepository } from "@/lib/github";
import { persistRepositoryAnalysis } from "@/lib/repository-storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const repoUrl = assertString(body.repoUrl, "repoUrl");
    const branch = typeof body.branch === "string" ? body.branch : "";

    if (repoUrl.length > 500) {
      throw new Error("Repository URL is too long.");
    }
    if (branch.length > 200) {
      throw new Error("Branch name is too long.");
    }

    const analysis = await analyzeGitHubRepository({ repoUrl, branch });
    const persistence = await persistRepositoryAnalysis(analysis);

    return NextResponse.json({
      ok: true,
      analysis,
      persistence,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Repository analysis failed.",
      },
      { status: 400 },
    );
  }
}

function assertString(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }

  return value;
}