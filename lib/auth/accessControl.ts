import { db } from "@/lib/db";
import { shareCodes, shareCodeUses, cheats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { isExpired } from "@/lib/utils";

export interface ShareCodeValidationResult {
  valid: boolean;
  error?: string;
  cheatId?: number;
  code?: string;
  shareCodeId?: number;
}

/**
 * Validate a share code and check if it can be used
 */
export async function validateShareCode(
  code: string
): Promise<ShareCodeValidationResult> {
  // Validate code format
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return { valid: false, error: "Invalid share code format" };
  }

  // Find share code
  const shareCodeRows = await db
    .select({
      id: shareCodes.id,
      cheatId: shareCodes.cheatId,
      status: shareCodes.status,
      expiresAt: shareCodes.expiresAt,
      usageLimit: shareCodes.usageLimit,
      usageCount: shareCodes.usageCount,
    })
    .from(shareCodes)
    .where(eq(shareCodes.code, code))
    .limit(1);

  const shareCode = shareCodeRows[0];

  if (!shareCode) {
    return { valid: false, error: "Share code not found" };
  }

  // Check if revoked
  if (shareCode.status === "revoked") {
    return { valid: false, error: "Share code has been revoked" };
  }

  // Check if expired
  if (shareCode.expiresAt && isExpired(shareCode.expiresAt)) {
    // Mark as expired
    await db
      .update(shareCodes)
      .set({ status: "expired" })
      .where(eq(shareCodes.id, shareCode.id));

    return { valid: false, error: "Share code has expired" };
  }

  // Check usage limit
  if (
    shareCode.usageLimit &&
    shareCode.usageCount >= shareCode.usageLimit
  ) {
    // Mark as expired
    await db
      .update(shareCodes)
      .set({ status: "expired" })
      .where(eq(shareCodes.id, shareCode.id));

    return { valid: false, error: "Share code usage limit reached" };
  }

  return {
    valid: true,
    cheatId: shareCode.cheatId,
    code,
    shareCodeId: shareCode.id,
  };
}

/**
 * Record share code usage
 */
export async function recordShareCodeUse(
  codeId: number,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  const updatedRows = await db
    .update(shareCodes)
    .set({ usageCount: sql`${shareCodes.usageCount} + 1` })
    .where(eq(shareCodes.id, codeId))
    .returning({ id: shareCodes.id });

  if (updatedRows.length === 0) {
    throw new Error("Share code not found");
  }

  // Record usage
  await db.insert(shareCodeUses).values({
    codeId,
    ipAddress,
    ...(userAgent ? { userAgent } : {}),
  });
}

/**
 * Check if user has access to a cheat via share code
 * Returns true if code is valid or cheat is public
 */
export async function canAccessCheat(
  cheatId: number,
  shareCode?: string
): Promise<{ canAccess: boolean; reason?: string }> {
  const cheatRows = await db
    .select({
      accessLevel: cheats.accessLevel,
    })
    .from(cheats)
    .where(eq(cheats.id, cheatId))
    .limit(1);

  const cheat = cheatRows[0];

  if (!cheat) {
    return { canAccess: false, reason: "Cheat not found" };
  }

  // Public cheats are always accessible
  if (cheat.accessLevel === "public") {
    return { canAccess: true };
  }

  // Protected or private cheats require share code
  if (!shareCode) {
    return {
      canAccess: false,
      reason: "Share code required for this cheat",
    };
  }

  // Validate share code
  const validation = await validateShareCode(shareCode);
  if (!validation.valid || validation.cheatId !== cheatId) {
    return {
      canAccess: false,
      reason: validation.error || "Invalid share code for this cheat",
    };
  }

  return { canAccess: true };
}
