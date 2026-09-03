import { NextResponse } from "next/server";
import { listRecentRepositories } from "@/lib/repository-storage";

export async function GET() {
  try {
    const repositories = await listRecentRepositories();
    return NextResponse.json({ ok: true, repositories });
  } catch {
    return NextResponse.json({ ok: true, repositories: [] });
  }
}