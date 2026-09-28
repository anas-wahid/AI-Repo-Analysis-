import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gh_oauth_state")?.value;
  const returnTo = cookieStore.get("gh_oauth_return_to")?.value || "/review";

  // Clear OAuth session cookies
  cookieStore.delete("gh_oauth_state");
  cookieStore.delete("gh_oauth_return_to");

  const targetPath = returnTo.startsWith("/") ? returnTo : `/${returnTo}`;
  const destUrl = `${env.appUrl}${targetPath}`;
  const separator = destUrl.includes("?") ? "&" : "?";

  // CSRF check
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${destUrl}${separator}error=invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${destUrl}${separator}error=no_code`);
  }

  if (!env.githubClientId || !env.githubClientSecret) {
    return NextResponse.redirect(`${destUrl}${separator}error=missing_config`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: env.githubClientId,
          client_secret: env.githubClientSecret,
          code,
          redirect_uri: env.githubRedirectUri,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        `${destUrl}${separator}error=${tokenData.error || "no_token"}`,
      );
    }

    // Store token in secure httpOnly cookie (7 days)
    cookieStore.set("gh_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.redirect(`${destUrl}${separator}connected=github`);
  } catch {
    return NextResponse.redirect(`${destUrl}${separator}error=token_exchange_failed`);
  }
}
