import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyPassword } from "@/lib/utils";
import type { User } from "next-auth";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

// Google is OPTIONAL for regular users; admins must use credentials.
const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      if (!email || !credentials?.password) return null;
      const [record] = await db.select({
        id: users.id, email: users.email, name: users.name,
        role: users.role, passwordHash: users.passwordHash,
      }).from(users).where(eq(users.email, email)).limit(1);
      if (!record?.passwordHash || !(await verifyPassword(credentials.password, record.passwordHash))) {
        return null;
      }
      return {
        id: String(record.id), email: record.email, name: record.name,
        role: record.role as User["role"],
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    async profile(profile) {
      const email = profile.email?.trim().toLowerCase();
      if (!email) throw new Error("Google account has no email");
      let [record] = await db.select({
        id: users.id, email: users.email, name: users.name, role: users.role,
      }).from(users).where(eq(users.email, email)).limit(1);
      if (!record) {
        [record] = await db.insert(users).values({
          email, name: profile.name, googleId: profile.sub, role: "user",
        }).onConflictDoNothing().returning({
          id: users.id, email: users.email, name: users.name, role: users.role,
        });
        if (!record) {
          [record] = await db.select({
            id: users.id, email: users.email, name: users.name, role: users.role,
          }).from(users).where(eq(users.email, email)).limit(1);
        }
      }
      if (!record) throw new Error("Cannot provision Google account");
      return {
        id: String(record.id), email: record.email, name: record.name,
        image: profile.picture, role: record.role as User["role"],
      };
    },
  }));
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Administrative accounts cannot bypass the password by using Google OAuth.
      return !(account?.provider === "google" && user.role !== "user");
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = Number(user.id);
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      if (!token.id || !Number.isSafeInteger(token.id)) return token;
      const [record] = await db.select({
        id: users.id, email: users.email, name: users.name,
        role: users.role, authVersion: users.authVersion,
      }).from(users).where(eq(users.id, token.id)).limit(1);
      if (!record || (token.authVersion !== undefined && token.authVersion !== record.authVersion)) {
        // Revoked credentials, deleted account or changed password invalidate prior sessions.
        token.id = 0;
        token.role = "user";
        token.email = "";
        token.name = null;
        return token;
      }
      // Sessions from before the auth-version rollout must sign in again.
      if (!user && token.authVersion === undefined) {
        token.id = 0;
        token.role = "user";
        token.email = "";
        return token;
      }
      token.authVersion = record.authVersion;
      token.role = record.role as User["role"];
      token.email = record.email;
      token.name = record.name;
      if (account?.provider === "google" && account.providerAccountId && record.role === "user") {
        const [linked] = await db.select({ id: accounts.id }).from(accounts).where(and(
          eq(accounts.provider, "google"), eq(accounts.providerAccountId, account.providerAccountId),
        )).limit(1);
        if (!linked) {
          await db.insert(accounts).values({
            userId: record.id, type: account.type, provider: account.provider,
            providerAccountId: account.providerAccountId,
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || 0;
        session.user.email = token.email || "";
        session.user.name = token.name || null;
        session.user.role = token.role || "user";
      }
      return session;
    },
  },
};
