import { users, cheats, shareCodes, shareCodeUses } from "@/lib/db/schema";

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type Cheat = typeof cheats.$inferSelect;
export type CheatInsert = typeof cheats.$inferInsert;

export type ShareCode = typeof shareCodes.$inferSelect;
export type ShareCodeInsert = typeof shareCodes.$inferInsert;

export type ShareCodeUse = typeof shareCodeUses.$inferSelect;
export type ShareCodeUseInsert = typeof shareCodeUses.$inferInsert;

export type Account = typeof users.$inferSelect;
export type Session = typeof users.$inferSelect;

// Custom types
export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "user";
}

export interface CheatWithAdmin extends Cheat {
  admin: {
    id: number;
    name: string | null;
    email: string;
  };
}

export interface ShareCodeValidation {
  valid: boolean;
  error?: string;
  cheatId?: number;
  code?: string;
}
