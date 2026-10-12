import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const [user] = await db.select({ id: users.id, role: users.role, email: users.email })
    .from(users).where(eq(users.id, session.user.id)).limit(1);
  return user && (user.role === "admin" || user.role === "super_admin") ? user : null;
}

export async function getCurrentSuperAdmin() {
  const user = await getCurrentAdmin();
  return user?.role === "super_admin" ? user : null;
}
