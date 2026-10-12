import "../utils/loadEnv";
import { db } from "./index";
import { users } from "./schema";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "../utils/helpers";

// One-time operator script: never accessible through the web app.
// ADMIN_EMAIL selects the owner, ADMIN_PASSWORD is only required to create a new owner.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email) throw new Error("ADMIN_EMAIL is required");
  const [existing] = await db.select({ id: users.id, role: users.role, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    if (!existing.passwordHash && (!password || password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
      throw new Error("Existing account has no password. Supply a strong ADMIN_PASSWORD to initialize it.");
    }
    if (existing.role !== "super_admin" || !existing.passwordHash) {
      await db.update(users).set({
        role: "super_admin",
        ...(!existing.passwordHash ? { passwordHash: await hashPassword(password!) } : {}),
        authVersion: sql`${users.authVersion} + 1`, updatedAt: new Date(),
      }).where(eq(users.id, existing.id));
    }
    console.log("Owner role ready. Existing password preserved if one was set. Sign in again.");
    return;
  }
  if (!password || password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Creating an owner requires ADMIN_PASSWORD (12+ chars, uppercase and number)");
  }
  await db.insert(users).values({
    email, name: process.env.ADMIN_NAME || "Owner", passwordHash: await hashPassword(password), role: "super_admin",
  });
  console.log("Super admin created. Credentials were not printed.");
}
main().then(() => process.exit(0)).catch(error => { console.error(error.message); process.exit(1); });
