import { NextResponse } from "next/server";
import { readAdSettings } from "@/lib/ads/settings";

export const dynamic = "force-dynamic";
export async function GET() {
  const settings = await readAdSettings();
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
