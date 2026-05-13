import { NextRequest, NextResponse } from "next/server";
import { apiError, getClientIp } from "@/lib/utils";
import {
  createOtp,
  findAdminUserByEmail,
  getOtpRateLimitKey,
  isOtpRateLimited,
  normalizeEmail,
  recordOtpRequest,
  storeOtp,
} from "@/lib/auth/otp";
import { isAdmin } from "@/lib/utils";
import { requestOtpSchema } from "@/lib/validations/schemas";
import { sendOtpEmail } from "@/lib/auth/gmail";

/**
 * POST /api/auth/otp/request
 * Request an OTP for admin login
 * Send an OTP for admin login using Gmail SMTP
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = getClientIp(
      req.headers.get("x-forwarded-for"),
      req.headers.get("x-real-ip")
    );

    const body = await req.json();
    const parsedBody = requestOtpSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        apiError(parsedBody.error.issues[0]?.message || "Invalid request", 400),
        { status: 400 }
      );
    }

    const email = normalizeEmail(parsedBody.data.email);
    const rateLimitKey = getOtpRateLimitKey(email, clientIp);

    if (isOtpRateLimited(rateLimitKey)) {
      return NextResponse.json(
        apiError("Too many OTP requests. Try again later.", 429),
        { status: 429 }
      );
    }

    const user = await findAdminUserByEmail(email);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        apiError("User is not an admin", 403),
        { status: 403 }
      );
    }

    const otp = createOtp();

    storeOtp(email, otp);
    recordOtpRequest(rateLimitKey);
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your Gmail inbox",
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
