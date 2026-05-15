import { db } from "@/lib/db";
import { cheats, favorites, users } from "@/lib/db/schema";
import { eq, and, getTableColumns } from "drizzle-orm";
import type { Cheat, CheatInsert, CheatWithAdmin } from "@/types";

const cheatColumns = getTableColumns(cheats);
const adminColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
};

/**
 * Get all public cheats
 */
export async function getPublicCheats(): Promise<CheatWithAdmin[]> {
  return db
    .select({
      ...cheatColumns,
      admin: adminColumns,
    })
    .from(cheats)
    .innerJoin(users, eq(cheats.adminId, users.id))
    .where(
      and(
        eq(cheats.accessLevel, "public"),
        eq(cheats.status, "active")
      )
    );
}

/**
 * Get cheat by ID (with access level checking)
 */
export async function getCheatById(id: number): Promise<CheatWithAdmin | null> {
  const rows = await db
    .select({
      ...cheatColumns,
      admin: adminColumns,
    })
    .from(cheats)
    .innerJoin(users, eq(cheats.adminId, users.id))
    .where(eq(cheats.id, id))
    .limit(1);

  return rows[0] || null;
}

/**
 * Get all cheats (admin only)
 */
export async function getAllCheats(): Promise<CheatWithAdmin[]> {
  return db
    .select({
      ...cheatColumns,
      admin: adminColumns,
    })
    .from(cheats)
    .innerJoin(users, eq(cheats.adminId, users.id))
    .orderBy(cheats.createdAt);
}

/**
 * Get cheats by admin (for dashboard)
 */
export async function getCheatsByAdmin(adminId: number): Promise<Cheat[]> {
  return db
    .select({
      ...cheatColumns,
    })
    .from(cheats)
    .where(eq(cheats.adminId, adminId));
}

/**
 * Create a new cheat (admin only)
 */
export async function createCheat(
  data: CheatInsert
): Promise<Cheat> {
  const [newCheat] = await db
    .insert(cheats)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newCheat;
}

/**
 * Update a cheat (admin only)
 */
export async function updateCheat(
  id: number,
  data: Partial<CheatInsert>
): Promise<Cheat | null> {
  const [updated] = await db
    .update(cheats)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cheats.id, id))
    .returning();

  return updated || null;
}

/**
 * Delete a cheat (admin only)
 */
export async function deleteCheat(id: number): Promise<boolean> {
  const result = await db
    .delete(cheats)
    .where(eq(cheats.id, id))
    .returning();

  return result.length > 0;
}

/**
 * Search cheats by title or tags
 */
export async function searchCheats(
  _query: string,
  accessLevel: string = "public"
): Promise<CheatWithAdmin[]> {
  return db
    .select({
      ...cheatColumns,
      admin: adminColumns,
    })
    .from(cheats)
    .innerJoin(users, eq(cheats.adminId, users.id))
    .where(
      and(
        eq(cheats.accessLevel, accessLevel),
        eq(cheats.status, "active")
      )
    );
}

/**
 * Add cheat to favorites
 */
export async function addToFavorites(userId: number, cheatId: number): Promise<void> {
  await db.insert(favorites).values({
    userId,
    cheatId,
  });
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(userId: number, cheatId: number): Promise<boolean> {
  const result = await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.cheatId, cheatId)
      )
    )
    .returning();

  return result.length > 0;
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: number): Promise<CheatWithAdmin[]> {
  return db
    .select({
      ...cheatColumns,
      admin: adminColumns,
    })
    .from(favorites)
    .innerJoin(cheats, eq(favorites.cheatId, cheats.id))
    .innerJoin(users, eq(cheats.adminId, users.id))
    .where(eq(favorites.userId, userId));
}
