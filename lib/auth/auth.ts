import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/utils";
import type { User } from "@/types";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth credentials are not set");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    // JWT callback - attach user data to token
    async jwt({ token, user, profile, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
      }

      // Handle Google OAuth account linking
      if (account?.provider === "google" && profile?.email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, profile.email),
        });

        if (existingUser) {
          // Link Google account to existing user
          const existingAccount = await db.query.accounts.findFirst({
            where: eq(accounts.providerAccountId, account.providerAccountId),
          });

          if (!existingAccount) {
            await db.insert(accounts).values({
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refreshToken: account.refresh_token,
              accessToken: account.access_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
              sessionState: account.session_state,
            });
          }

          token.id = existingUser.id;
          token.role = existingUser.role;
          token.name = existingUser.name;
        } else if (user) {
          // Create new user from Google OAuth
          token.id = user.id;
          token.role = user.role;
        }
      }

      return token;
    },

    // Session callback - attach token data to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },

    // Sign in callback - only allow login if not admin (admins use OTP)
    async signIn({ user, account }) {
      // Admin users cannot sign in via credentials or Google (they use OTP)
      if (user.role === "admin" && account?.provider !== "google") {
        return false;
      }

      return true;
    },
  },
  providers: [
    // Credentials provider for password-based login (non-admin users)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email.toLowerCase()),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Verify password
        const passwordValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        // Admins cannot use credentials provider
        if (user.role === "admin") {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: null,
          role: user.role,
        } as User & { id: string };
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Find or create user
        let user = await db.query.users.findFirst({
          where: eq(users.email, profile.email),
        });

        if (!user) {
          // Create new user from Google profile
          const newUser = await db
            .insert(users)
            .values({
              email: profile.email,
              name: profile.name,
              googleId: profile.id,
              role: "user", // Default to user role
            })
            .returning();

          user = newUser[0];
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: profile.picture,
          role: user.role,
        } as User & { id: string };
      },
    }),
  ],
};

export default NextAuth(authOptions);
