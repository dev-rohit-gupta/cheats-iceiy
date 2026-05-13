import { db } from "./index";
import { users, cheats, shareCodes } from "./schema";
import bcryptjs from "bcryptjs";
import { generateShareCode } from "@/lib/auth/shareCode";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create admin user
    const adminPassword = await bcryptjs.hash("admin123456", 10);
    const adminUser = await db
      .insert(users)
      .values({
        email: "admin@cheats.local",
        name: "Admin User",
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
  Email: admin@cheats.local
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
