import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

type GitHubUser = {
  login: string;
  avatar_url: string;
  name: string | null;
};

async function fetchGitHubUser(token: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ai-testing-automation-agent",
      },
      // Don't cache this — it reflects live connection status
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<GitHubUser>;
  } catch {
    return null;
  }
}

export async function GET() {
  // Priority 1: OAuth token stored in cookie
  const cookieStore = await cookies();
  const oauthToken = cookieStore.get("gh_token")?.value;

  if (oauthToken) {
    const user = await fetchGitHubUser(oauthToken);
    if (user) {
      return NextResponse.json({
        ok: true,
        connected: true,
        via: "oauth",
        username: user.login,
        displayName: user.name || user.login,
        avatarUrl: user.avatar_url,
        message: `Connected as ${user.login} (OAuth)`,
        canDisconnect: true,
      });
    }
    // Token is invalid — clear it
    cookieStore.delete("gh_token");
  }

  // Priority 2: Static GITHUB_TOKEN env var
  if (env.githubToken) {
    const user = await fetchGitHubUser(env.githubToken);
    if (user) {
      return NextResponse.json({
        ok: true,
        connected: true,
        via: "token",
        username: user.login,
        displayName: user.name || user.login,
        avatarUrl: user.avatar_url,
        message: `Connected as ${user.login} (env token)`,
        canDisconnect: false,
      });
    }
  }

  // Not connected
  const oauthConfigured = Boolean(env.githubClientId);
  return NextResponse.json({
    ok: true,
    connected: false,
    via: "none",
    username: null,
    avatarUrl: null,
    canConnect: oauthConfigured,
    message: oauthConfigured
      ? "Click 'Connect GitHub' to authorize"
      : "Add GITHUB_TOKEN or GITHUB_CLIENT_ID to .env.local",
  });
}
