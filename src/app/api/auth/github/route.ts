import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  if (!env.githubClientId) {
    return NextResponse.json(
      { ok: false, error: "GITHUB_CLIENT_ID is not configured. Add it to .env.local and create a GitHub OAuth App." },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const referer = request.headers.get("referer");
  const returnToParam = searchParams.get("returnTo");

  let targetReturn = "/review";
  if (returnToParam && returnToParam.startsWith("/")) {
    targetReturn = returnToParam;
  } else if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.pathname && refUrl.pathname !== "/") {
        targetReturn = refUrl.pathname + refUrl.search;
      }
    } catch {}
  }

  // Generate a random state value for CSRF protection
  const state = crypto.randomUUID();

  // Store state and returnTo in short-lived cookies (5 min)
  const cookieStore = await cookies();
  cookieStore.set("gh_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 5, // 5 minutes
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set("gh_oauth_return_to", targetReturn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 5, // 5 minutes
    path: "/",
    sameSite: "lax",
  });

  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubRedirectUri,
    scope: "read:user user:email repo",
    state,
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
}
