import { NextRequest, NextResponse } from "next/server";
import { getCurrentSuperAdmin } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/utils";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const passwordSchema = z.object({ password: z.string().min(12).max(128).regex(/[A-Z]/).regex(/[0-9]/) });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getCurrentSuperAdmin();
    if (!actor) return NextResponse.json({ error: "Super admin required" }, { status: 403 });
    const { id } = await params;
    const targetId = Number(id);
    if (!Number.isSafeInteger(targetId) || targetId <= 0 || targetId === actor.id) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
    const parsed = passwordSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Password must be 12+ characters with uppercase and a number" }, { status: 400 });
    const [target] = await db.select({ id: users.id, role: users.role, email: users.email }).from(users).where(eq(users.id, targetId)).limit(1);
    if (!target || target.role !== "admin") return NextResponse.json({ error: "Only standard admin passwords may be reset here" }, { status: 403 });
    const [updated] = await db.update(users).set({
      passwordHash: await hashPassword(parsed.data.password),
      authVersion: sql`${users.authVersion} + 1`, updatedAt: new Date(),
    }).where(and(eq(users.id, targetId), eq(users.role, "admin"))).returning({ id: users.id });
    if (!updated) return NextResponse.json({ error: "Admin role changed" }, { status: 409 });
    await db.insert(auditLogs).values({ adminId: actor.id, action: "RESET_ADMIN_PASSWORD", resource: "user", resourceId: targetId, details: JSON.stringify({ email: target.email }) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin password reset error", error);
    return NextResponse.json({ error: "Could not reset password" }, { status: 500 });
  }
}
