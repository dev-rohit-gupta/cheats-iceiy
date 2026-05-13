import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255}),
    passwordHash: varchar("password_hash", { length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    role: varchar("role", { length: 50 }).notNull().default("user"), // "admin" or "user"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    googleIdIdx: uniqueIndex("users_google_id_idx").on(table.googleId),
  })
);

// NextAuth Accounts table
export const accounts = pgTable(
  "accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  }
);

// Sessions table
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

// Cheats table
export const cheats = pgTable(
  "cheats",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    driveLink: text("drive_link").notNull(), // Full URL to Google Drive or similar
    branch: varchar("branch", { length: 100 }), // Subject branch/topic
    subject: varchar("subject", { length: 100 }).notNull(),
    notes: text("notes"), // Plain text or markdown notes
    accessLevel: varchar("access_level", { length: 50 }).notNull().default("public"), // "public", "protected", "private"
    status: varchar("status", { length: 50 }).notNull().default("active"), // "active", "archived", "draft"
    tags: text("tags"), // Comma-separated tags
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }
);

// Share codes table
export const shareCodes = pgTable(
  "share_codes",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    cheatId: integer("cheat_id")
      .notNull()
      .references(() => cheats.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    usageLimit: integer("usage_limit"), // null = unlimited
    usageCount: integer("usage_count").notNull().default(0),
    scope: varchar("scope", { length: 50 }).notNull().default("single"), // "single" (one cheat) or "all" (all cheats)
    status: varchar("status", { length: 50 }).notNull().default("active"), // "active", "revoked", "expired"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
  }
);

// Share code uses (audit trail)
export const shareCodeUses = pgTable(
  "share_code_uses",
  {
    id: serial("id").primaryKey(),
    codeId: integer("code_id")
      .notNull()
      .references(() => shareCodes.id, { onDelete: "cascade" }),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    accessedAt: timestamp("accessed_at", { withTimezone: true }).defaultNow(),
  }
);

// Audit logs table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(), // "create", "update", "delete", "share"
    resource: varchar("resource", { length: 100 }).notNull(), // "cheat", "share_code", "user"
    resourceId: integer("resource_id"),
    details: text("details"), // JSON or structured details
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

// Favorites table
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cheatId: integer("cheat_id")
      .notNull()
      .references(() => cheats.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cheats: many(cheats),
  sessions: many(sessions),
  accounts: many(accounts),
  auditLogs: many(auditLogs),
  favorites: many(favorites),
}));

export const cheatsRelations = relations(cheats, ({ one, many }) => ({
  admin: one(users, {
    fields: [cheats.adminId],
    references: [users.id],
  }),
  shareCodes: many(shareCodes),
  favorites: many(favorites),
}));

export const shareCodesRelations = relations(shareCodes, ({ one, many }) => ({
  cheat: one(cheats, {
    fields: [shareCodes.cheatId],
    references: [cheats.id],
  }),
  creator: one(users, {
    fields: [shareCodes.createdBy],
    references: [users.id],
  }),
  uses: many(shareCodeUses),
}));

export const shareCodeUsesRelations = relations(shareCodeUses, ({ one }) => ({
  code: one(shareCodes, {
    fields: [shareCodeUses.codeId],
    references: [shareCodes.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  cheat: one(cheats, {
    fields: [favorites.cheatId],
    references: [cheats.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id],
  }),
}));
