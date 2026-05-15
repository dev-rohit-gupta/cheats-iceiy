import { randomInt } from "crypto";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type OtpRecord = {
  code: string;
  expiresAt: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_REQUESTS_PER_HOUR = 3;

const otpStore = new Map<string, OtpRecord>();
const otpRateLimits = new Map<string, RateLimitRecord>();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

export function getOtpRateLimitKey(email: string, clientIp: string): string {
  return `${normalizeEmail(email)}:${clientIp}`;
}

export function isOtpRateLimited(rateLimitKey: string): boolean {
  const rateLimit = otpRateLimits.get(rateLimitKey);
  if (!rateLimit) {
    return false;
  }

  if (rateLimit.resetAt <= Date.now()) {
    otpRateLimits.delete(rateLimitKey);
    return false;
  }

  return rateLimit.count >= MAX_OTP_REQUESTS_PER_HOUR;
}

export function recordOtpRequest(rateLimitKey: string): void {
  const existing = otpRateLimits.get(rateLimitKey);

  if (!existing || existing.resetAt <= Date.now()) {
    otpRateLimits.set(rateLimitKey, {
      count: 1,
      resetAt: Date.now() + 60 * 60 * 1000,
    });
    return;
  }

  existing.count += 1;
}

export function storeOtp(email: string, code: string): void {
  otpStore.set(normalizeEmail(email), {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
}

export function consumeOtp(email: string, otp: string): {
  ok: true;
} | {
  ok: false;
  message: string;
  status: number;
} {
  const normalizedEmail = normalizeEmail(email);
  const storedOtp = otpStore.get(normalizedEmail);

  if (!storedOtp) {
    return { ok: false, message: "OTP not found or expired", status: 400 };
  }

  if (storedOtp.expiresAt < Date.now()) {
    otpStore.delete(normalizedEmail);
    return { ok: false, message: "OTP expired", status: 400 };
  }

  if (storedOtp.code !== otp) {
    return { ok: false, message: "Invalid OTP", status: 401 };
  }

  otpStore.delete(normalizedEmail);
  return { ok: true };
}

export async function findAdminUserByEmail(email: string) {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return rows[0];
}
