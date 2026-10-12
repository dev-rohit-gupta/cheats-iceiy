import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [record] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!record) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [google] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.userId, session.user.id), eq(accounts.provider, "google"))).limit(1);
  return NextResponse.json({ hasPassword: Boolean(record.passwordHash), googleConnected: Boolean(google) }, { headers: { "Cache-Control": "no-store" } });
}
