import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError, generateRandomString, isAdmin } from "@/lib/utils";

// In-memory OTP store (shared with request endpoint)
// In production, use Redis or database
const otpStore: Map<string, { code: string; expiresAt: number }> = new Map();

/**
 * POST /api/auth/otp/verify
 * Verify OTP and create session for admin
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        apiError("Email is required", 400),
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        apiError("OTP is required", 400),
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
      return NextResponse.json(
        apiError("OTP not found or expired", 400),
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (storedOtp.expiresAt < Date.now()) {
      otpStore.delete(email);
      return NextResponse.json(
        apiError("OTP expired", 400),
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOtp.code !== otp) {
      return NextResponse.json(
        apiError("Invalid OTP", 401),
        { status: 401 }
      );
    }

    // Find admin user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        apiError("User is not an admin", 403),
        { status: 403 }
      );
    }

    // Create session token
    const sessionToken = generateRandomString(32);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      sessionToken,
      userId: user.id,
      expires: expiresAt,
    });

    // Clear used OTP
    otpStore.delete(email);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      sessionToken,
    });

    // Set secure session cookie
    response.cookies.set("next-auth.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
