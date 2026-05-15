import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/utils";
import { consumeOtp, findAdminUserByEmail, normalizeEmail } from "@/lib/auth/otp";
import type { User } from "next-auth";

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
        token.id = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
      }

      // Handle Google OAuth account linking
      if (account?.provider === "google" && profile?.email) {
        const existingUserRows = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
          })
          .from(users)
          .where(eq(users.email, profile.email))
          .limit(1);

        const existingUser = existingUserRows[0];

        if (existingUser) {
          // Link Google account to existing user
          const existingAccountRows = await db
            .select({
              id: accounts.id,
            })
            .from(accounts)
            .where(eq(accounts.providerAccountId, account.providerAccountId))
            .limit(1);

          const existingAccount = existingAccountRows[0];

          if (!existingAccount) {
            await db.insert(accounts).values({
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              ...(account.refresh_token ? { refreshToken: account.refresh_token } : {}),
              ...(account.access_token ? { accessToken: account.access_token } : {}),
              ...(account.expires_at ? { expiresAt: account.expires_at } : {}),
              ...(account.token_type ? { tokenType: account.token_type } : {}),
              ...(account.scope ? { scope: account.scope } : {}),
              ...(account.id_token ? { idToken: account.id_token } : {}),
              ...(account.session_state ? { sessionState: account.session_state } : {}),
            });
          }

          token.id = existingUser.id;
          token.role = (existingUser.role === "admin" ? "admin" : "user") as "user" | "admin";
          token.name = existingUser.name;
        } else if (user) {
          // Create new user from Google OAuth
          token.id = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
          token.role = user.role;
        }
      }

      return token;
    },

    // Session callback - attach token data to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as number) || 0;
        session.user.email = (token.email as string) || "";
        session.user.role = (token.role as "user" | "admin") || "user";
        session.user.name = (token.name as string | null) || null;
      }
      return session;
    },

    // Sign in callback - only allow login if not admin (admins use OTP)
    async signIn({ user, account }) {
      if (user.role === "admin") {
        return account?.provider === "admin-otp";
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
        const userRows = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, normalizeEmail(credentials.email)))
          .limit(1);

        const user = userRows[0];

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

        // Return user object with proper typing
        const result: User = {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: null,
          role: user.role === "admin" ? "admin" : "user",
        };

        return result;
      },
    }),

    CredentialsProvider({
      id: "admin-otp",
      name: "Admin OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          return null;
        }

        const user = await findAdminUserByEmail(credentials.email);
        if (!user || user.role !== "admin") {
          return null;
        }

        const otpResult = consumeOtp(credentials.email, credentials.otp);
        if (!otpResult.ok) {
          return null;
        }

        const result: User = {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: null,
          role: "admin",
        };

        return result;
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Find or create user
        const userRows = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
          })
          .from(users)
          .where(eq(users.email, profile.email))
          .limit(1);

        let user = userRows[0];

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

        const result: User = {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: profile.picture,
          role: user.role === "admin" ? "admin" : "user",
        };

        return result;
      },
    }),
  ],
};

export default NextAuth(authOptions);
