import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
};

async function fetchRepos(token: string, page = 1): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ai-testing-automation-agent",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json() as Promise<GitHubRepo[]>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  // Get token: cookie first, then env
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value || env.githubToken;

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "Not connected to GitHub. Connect via OAuth or add GITHUB_TOKEN.",
        repos: [],
      },
      { status: 401 },
    );
  }

  try {
    const repos = await fetchRepos(token);

    // Filter by search query if provided
    const filtered = query
      ? repos.filter(
          (r) =>
            r.name.toLowerCase().includes(query) ||
            r.full_name.toLowerCase().includes(query) ||
            (r.description?.toLowerCase().includes(query) ?? false),
        )
      : repos;

    return NextResponse.json({
      ok: true,
      repos: filtered.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        description: r.description,
        defaultBranch: r.default_branch,
        language: r.language,
        stars: r.stargazers_count,
        updatedAt: r.updated_at,
        htmlUrl: r.html_url,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch repos",
        repos: [],
      },
      { status: 500 },
    );
  }
}
