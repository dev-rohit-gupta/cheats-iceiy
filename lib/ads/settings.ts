import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Only supported formats/providers are configurable. No arbitrary JS/URLs from admins.
export const adSettingsSchema = z.object({
  enabled: z.boolean(),
  banners: z.boolean(),
  native: z.boolean(),
  sidebar: z.boolean(),
  highperformanceformat: z.boolean(),
  effectivecpmnetwork: z.boolean(),
}).strict();
export type AdSettings = z.infer<typeof adSettingsSchema>;

// Fail CLOSED. The previous ad networks may serve unexpected redirects.
export const defaultAdSettings: AdSettings = Object.freeze({
  enabled: false, banners: true, native: true, sidebar: false,
  highperformanceformat: false, effectivecpmnetwork: false,
});

export async function readAdSettings(): Promise<AdSettings> {
  if (process.env.ADS_EMERGENCY_OFF === "true") return { ...defaultAdSettings };
  try {
    const [setting] = await db.select({ value: siteSettings.value }).from(siteSettings)
      .where(eq(siteSettings.key, "advertisements")).limit(1);
    if (!setting) return { ...defaultAdSettings };
    const parsed = adSettingsSchema.safeParse(JSON.parse(setting.value));
    return parsed.success ? parsed.data : { ...defaultAdSettings };
  } catch (error) {
    // Also protects production until the migration has been applied.
    console.error("Ad settings unavailable; ads disabled", error);
    return { ...defaultAdSettings };
  }
}

export async function saveAdSettings(value: AdSettings) {
  await db.insert(siteSettings).values({ key: "advertisements", value: JSON.stringify(value), updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: JSON.stringify(value), updatedAt: new Date() } });
}
