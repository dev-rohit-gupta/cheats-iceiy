import { NextRequest, NextResponse } from "next/server";
import { readAdSettings, saveAdSettings, adSettingsSchema } from "@/lib/ads/settings";
import { getCurrentSuperAdmin } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function GET() {
  if (!(await getCurrentSuperAdmin())) return NextResponse.json({ error: "Super admin required" }, { status: 403 });
  return NextResponse.json(await readAdSettings(), { headers: { "Cache-Control": "no-store" } });
}
export async function PUT(req: NextRequest) {
  try {
    const actor = await getCurrentSuperAdmin();
    if (!actor) return NextResponse.json({ error: "Super admin required" }, { status: 403 });
    if (process.env.ADS_EMERGENCY_OFF === "true") {
      return NextResponse.json({ error: "Emergency advertisement block is enabled on the server" }, { status: 423 });
    }
    const parsed = adSettingsSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid ad settings" }, { status: 400 });
    const previous = await readAdSettings();
    await saveAdSettings(parsed.data);
    await db.insert(auditLogs).values({
      adminId: actor.id, action: "UPDATE_AD_SETTINGS", resource: "site_settings",
      details: JSON.stringify({ before: previous, after: parsed.data }),
    });
    return NextResponse.json({ success: true, settings: parsed.data });
  } catch (error) {
    console.error("Update ad settings error", error);
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }
}
