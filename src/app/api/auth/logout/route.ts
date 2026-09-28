import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referer = request.headers.get("referer");
  const returnToParam = searchParams.get("returnTo");

  let safeReturn = "/review";
  if (returnToParam && returnToParam.startsWith("/")) {
    safeReturn = returnToParam;
  } else if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.pathname && refUrl.pathname !== "/") {
        safeReturn = refUrl.pathname;
      }
    } catch {}
  }

  const cookieStore = await cookies();
  cookieStore.delete("gh_token");
  return NextResponse.redirect(`${env.appUrl}${safeReturn}`);
}
