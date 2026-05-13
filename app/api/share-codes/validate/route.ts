import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateShareCode, recordShareCodeUse } from "@/lib/auth/accessControl";
import { apiError, getClientIp } from "@/lib/utils";
import { eq } from "drizzle-orm";

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
    const shareCodeRecord = await db.query.shareCodes.findFirst({
      where: (sc) => eq(sc.code, code),
    });

    if (shareCodeRecord) {
      const clientIp = getClientIp(
        req.headers.get("x-forwarded-for"),
        req.headers.get("x-real-ip")
      );
      await recordShareCodeUse(
        shareCodeRecord.id,
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
