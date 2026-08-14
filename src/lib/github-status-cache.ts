/**
 * Client-side cache for /api/github/status.
 *
 * Both the Sidebar and RepositoryAnalyzer fetch GitHub status on mount.
 * Without caching, every page navigation triggers 2–3 redundant round-trips
 * to the GitHub API (each taking 400ms–2.7s).
 *
 * This module caches the result in memory for CACHE_TTL_MS so subsequent
 * navigations reuse the previous response instantly.
 */

export type GitHubStatusCache = {
  ok: boolean;
  connected: boolean;
  via: "oauth" | "token" | "none";
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  canConnect: boolean;
  canDisconnect: boolean;
  message: string;
};

const CACHE_TTL_MS = 60_000; // 60 seconds

let cachedStatus: GitHubStatusCache | null = null;
let cachedAt = 0;
let inflight: Promise<GitHubStatusCache | null> | null = null;

export async function getCachedGitHubStatus(
  forceRefresh = false,
): Promise<GitHubStatusCache | null> {
  const now = Date.now();

  // Return cached result if still fresh
  if (!forceRefresh && cachedStatus && now - cachedAt < CACHE_TTL_MS) {
    return cachedStatus;
  }

  // Deduplicate concurrent requests
  if (inflight) return inflight;

  inflight = fetchGitHubStatus();
  try {
    const result = await inflight;
    return result;
  } finally {
    inflight = null;
  }
}

async function fetchGitHubStatus(): Promise<GitHubStatusCache | null> {
  try {
    const res = await fetch("/api/github/status");
    const data = await res.json();
    if (data.ok) {
      cachedStatus = data as GitHubStatusCache;
      cachedAt = Date.now();
      return cachedStatus;
    }
    return null;
  } catch {
    return null;
  }
}

/** Call this when the user disconnects/connects to force a fresh fetch */
export function invalidateGitHubStatusCache() {
  cachedStatus = null;
  cachedAt = 0;
}
