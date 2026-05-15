import { NextRequest, NextResponse } from "next/server";
import { validateShareCode, recordShareCodeUse } from "@/lib/auth/accessControl";
import { apiError, getClientIp } from "@/lib/utils";

/**
 * POST /api/share-codes/validate
 * Validate a share code and return access session
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        apiError("Code is required", 400),
        { status: 400 }
      );
    }

    // Validate share code
    const validation = await validateShareCode(code);
    if (!validation.valid) {
      return NextResponse.json(
        apiError(validation.error || "Invalid share code", 400),
        { status: 400 }
      );
    }

    // Record usage
    if (validation.shareCodeId) {
      const clientIp = getClientIp(
        req.headers.get("x-forwarded-for"),
        req.headers.get("x-real-ip")
      );
      await recordShareCodeUse(
        validation.shareCodeId,
        clientIp,
        req.headers.get("user-agent") || undefined
      );
    }

    return NextResponse.json({
      success: true,
      message: "Share code validated",
      cheatId: validation.cheatId,
      code: validation.code,
    });
  } catch (error) {
    console.error("Validate share code error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
