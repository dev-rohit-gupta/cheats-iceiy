import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shareCodes, auditLogs } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { apiError, isAdmin } from "@/lib/utils";
import { eq } from "drizzle-orm";

/**
 * POST /api/share-codes/revoke
 * Revoke a share code (admin only)
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
    const { codeId } = body;

    if (!codeId) {
      return NextResponse.json(
        apiError("Code ID is required", 400),
        { status: 400 }
      );
    }

    // Find and revoke share code
    const shareCode = await db.query.shareCodes.findFirst({
      where: (sc) => eq(sc.id, codeId),
    });

    if (!shareCode) {
      return NextResponse.json(
        apiError("Share code not found", 404),
        { status: 404 }
      );
    }

    // Update status
    const updated = await db
      .update(shareCodes)
      .set({ status: "revoked" })
      .where(eq(shareCodes.id, codeId))
      .returning();

    // Log audit
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "revoke",
      resource: "share_code",
      resourceId: codeId,
      details: JSON.stringify({ code: shareCode.code }),
    });

    return NextResponse.json({
      success: true,
      message: "Share code revoked",
      code: updated[0].code,
    });
  } catch (error) {
    console.error("Revoke share code error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
