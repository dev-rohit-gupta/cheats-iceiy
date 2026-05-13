import { NextRequest, NextResponse } from "next/server";
import { apiError, getClientIp } from "@/lib/utils";

// Simple in-memory OTP store (for demo; use Redis or database in production)
const otpStore: Map<string, { code: string; expiresAt: number }> = new Map();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_REQUESTS_PER_HOUR = 3;

// Rate limiting for OTP requests
const otpRateLimits: Map<string, { count: number; resetAt: number }> =
  new Map();

/**
 * POST /api/auth/otp/request
 * Request an OTP for admin login
 * In production, send via email using Resend, SendGrid, etc.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = getClientIp(
      req.headers.get("x-forwarded-for"),
      req.headers.get("x-real-ip")
    );

    // Check rate limit
    const rateLimit = otpRateLimits.get(clientIp);
    if (rateLimit && rateLimit.resetAt > Date.now() && rateLimit.count >= MAX_OTP_REQUESTS_PER_HOUR) {
      return NextResponse.json(
        apiError("Too many OTP requests. Try again later.", 429),
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        apiError("Email is required", 400),
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.random()
      .toString()
      .substring(2, 2 + OTP_LENGTH)
      .padEnd(OTP_LENGTH, "0")
      .substring(0, OTP_LENGTH);

    // Store OTP
    otpStore.set(email, {
      code: otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // Update rate limit
    if (!rateLimit || rateLimit.resetAt <= Date.now()) {
      otpRateLimits.set(clientIp, {
        count: 1,
        resetAt: Date.now() + 60 * 60 * 1000, // 1 hour
      });
    } else {
      rateLimit.count += 1;
    }

    // TODO: In production, send OTP via email using Resend/SendGrid
    console.log(`[DEBUG] OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent to email (check logs for demo)",
      // REMOVE in production - only for demo purposes
      debug_otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
