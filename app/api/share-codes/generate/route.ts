import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shareCodes, auditLogs } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { generateShareCode } from "@/lib/auth/shareCode";
import { apiError, isAdmin } from "@/lib/utils";
import { createShareCodeSchema } from "@/lib/validations";

/**
 * POST /api/share-codes/generate
 * Create a new share code (admin only)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json(
        apiError("Unauthorized - Admin access required", 403),
        { status: 403 }
      );
    }

    const body = await req.json();
    const validationResult = createShareCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        apiError(
          "Invalid input: " +
            validationResult.error.errors.map((e) => e.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const { cheatId, expiresAt, usageLimit, scope } = validationResult.data;

    // Generate unique code
    let code: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateShareCode();
      const existing = await db.query.shareCodes.findFirst({
        where: (sc, { eq }) => eq(sc.code, code),
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        apiError("Failed to generate unique share code", 500),
        { status: 500 }
      );
    }

    // Create share code
    const newShareCode = await db
      .insert(shareCodes)
      .values({
        code: code!,
        cheatId,
        expiresAt: expiresAt ?? null,
        usageLimit: usageLimit ?? null,
        scope,
        createdBy: session.user.id,
      })
      .returning();

    // Log audit
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "create",
      resource: "share_code",
      resourceId: newShareCode[0].id,
      details: JSON.stringify({
        code: newShareCode[0].code,
        cheatId: newShareCode[0].cheatId,
        expiresAt: newShareCode[0].expiresAt,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Share code generated",
      code: newShareCode[0].code,
      id: newShareCode[0].id,
      expiresAt: newShareCode[0].expiresAt,
    });
  } catch (error) {
    console.error("Generate share code error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
