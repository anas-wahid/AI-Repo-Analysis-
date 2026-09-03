import { NextRequest, NextResponse } from "next/server";

const PUBLIC_API_ROUTES = [
  "/api/health",
  "/api/auth/github",
  "/api/auth/github/callback",
  "/api/auth/logout",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const ghToken = request.cookies.get("gh_token")?.value;
  const hasGITHUB_TOKEN = Boolean(process.env.GITHUB_TOKEN);
  const hasDATABASE_URL = Boolean(process.env.DATABASE_URL);

  if (!ghToken && !hasGITHUB_TOKEN && !hasDATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: "Authentication required. Connect GitHub or configure environment variables.",
      },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
