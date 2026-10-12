import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { getCurrentSuperAdmin } from "@/lib/auth/permissions";
import { apiError, apiResponse, hashPassword } from "@/lib/utils";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";

const createAdminSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255).transform(email => email.toLowerCase()),
  password: z.string().min(12).max(128).regex(/[A-Z]/, "Use an uppercase letter").regex(/[0-9]/, "Use a number"),
});

export async function GET(req: NextRequest) {
  try {
    if (!(await getCurrentSuperAdmin())) return NextResponse.json(apiError("Super admin access required", 403), { status: 403 });
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 50, 1), 200);
    const offset = Math.max(Number(req.nextUrl.searchParams.get("offset")) || 0, 0);
    const rows = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt, hasPassword: sql<boolean>`${users.passwordHash} IS NOT NULL` })
      .from(users).orderBy(users.createdAt).limit(limit).offset(offset);
    return NextResponse.json(apiResponse({ users: rows, limit, offset }));
  } catch (error) {
    console.error("List users error", error);
    return NextResponse.json(apiError("Internal server error", 500), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await getCurrentSuperAdmin();
    if (!actor) return NextResponse.json(apiError("Super admin access required", 403), { status: 403 });
    const parsed = createAdminSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json(apiError(parsed.error.issues[0]?.message || "Invalid input", 400), { status: 400 });
    const { email, name, password } = parsed.data;
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) return NextResponse.json(apiError("Email already registered. Use role management for an existing account with a password.", 409), { status: 409 });
    const [created] = await db.insert(users).values({ email, name, role: "admin", passwordHash: await hashPassword(password) })
      .onConflictDoNothing().returning({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt });
    if (!created) return NextResponse.json(apiError("Email already registered", 409), { status: 409 });
    await db.insert(auditLogs).values({ adminId: actor.id, action: "CREATE_ADMIN", resource: "user", resourceId: created.id, details: JSON.stringify({ email }) });
    return NextResponse.json(apiResponse(created), { status: 201 });
  } catch (error) {
    console.error("Create admin error", error);
    return NextResponse.json(apiError("Internal server error", 500), { status: 500 });
  }
}
