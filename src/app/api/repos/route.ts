import { NextResponse } from "next/server";
import { listRecentRepositories } from "@/lib/repository-storage";

export async function GET() {
  const repositories = await listRecentRepositories();

  return NextResponse.json({
    ok: true,
    repositories,
  });
}