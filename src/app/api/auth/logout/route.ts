import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("gh_token");
  return NextResponse.redirect(`${env.appUrl}/`);
}
