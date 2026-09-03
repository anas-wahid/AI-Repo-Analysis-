import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gh_oauth_state")?.value;

  // CSRF check
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      `${env.appUrl}/?error=invalid_state`,
    );
  }

  // Clear the state cookie
  cookieStore.delete("gh_oauth_state");

  if (!code) {
    return NextResponse.redirect(`${env.appUrl}/?error=no_code`);
  }

  if (!env.githubClientId || !env.githubClientSecret) {
    return NextResponse.redirect(`${env.appUrl}/?error=missing_config`);
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
        `${env.appUrl}/?error=${tokenData.error || "no_token"}`,
      );
    }

    // Store token in secure httpOnly cookie (7 days)
    cookieStore.set("gh_token", tokenData.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.redirect(`${env.appUrl}/?connected=github`);
  } catch {
    return NextResponse.redirect(`${env.appUrl}/?error=token_exchange_failed`);
  }
}
