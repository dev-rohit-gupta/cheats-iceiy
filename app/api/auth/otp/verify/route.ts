import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/utils";
import { consumeOtp, findAdminUserByEmail } from "@/lib/auth/otp";
import { isAdmin } from "@/lib/utils";
import { verifyOtpSchema } from "@/lib/validations/schemas";

/**
 * POST /api/auth/otp/verify
 * Verify OTP code validity for admin login
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsedBody = verifyOtpSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        apiError(parsedBody.error.issues[0]?.message || "Invalid request", 400),
        { status: 400 }
      );
    }

    const { email, otp } = parsedBody.data;
    const user = await findAdminUserByEmail(email);

    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        apiError("User is not an admin", 403),
        { status: 403 }
      );
    }

    const otpResult = consumeOtp(email, otp);
    if (!otpResult.ok) {
      return NextResponse.json(
        apiError(otpResult.message, otpResult.status),
        { status: otpResult.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
