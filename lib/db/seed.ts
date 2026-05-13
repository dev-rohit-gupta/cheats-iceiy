import 'dotenv/config';
import { db } from "./index";
import { users, cheats, shareCodes } from "./schema";
import bcryptjs from "bcryptjs";
import { generateShareCode } from "@/lib/auth/shareCode";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(" ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment variables");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create admin user
    const adminPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
    const adminUser = await db
      .insert(users)
      .values({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash: adminPassword,
        role: "admin",
      })
      .returning();

    console.log("✅ Created admin user:", adminUser[0].email);

    // Create sample cheat
    const sampleCheat = await db
      .insert(cheats)
      .values({
        title: "Physics Formulas",
        driveLink: "https://drive.google.com/file/d/example/view",
        subject: "Physics",
        branch: "Mechanics",
        notes: "Common physics formulas for mechanics and dynamics",
        accessLevel: "public",
        status: "active",
        tags: "physics,formulas,mechanics",
        adminId: adminUser[0].id,
      })
      .returning();

    console.log("✅ Created sample cheat:", sampleCheat[0].title);

    // Create share code for sample cheat
    const shareCode = generateShareCode();
    await db
      .insert(shareCodes)
      .values({
        code: shareCode,
        cheatId: sampleCheat[0].id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: 100,
        scope: "single",
        status: "active",
        createdBy: adminUser[0].id,
      });

    console.log("✅ Created share code:", shareCode);

    console.log("✨ Seeding complete!");
    console.log(`
Admin Credentials:
  Email: dev.rohit.roxy@gmail.com
  Password: admin123456

Share Code (for testing):
  ${shareCode}
    `);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Run seed
seed().then(() => process.exit(0));
