import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { apiError, apiResponse, isAdmin } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/admin/users/[id]/demote
 * Demote admin to user (admin only)
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json(
        apiError("Unauthorized - Admin access required", 403),
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json(apiError("Invalid user ID", 400), { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        apiError("You cannot demote yourself", 403),
        { status: 403 }
      );
    }
    const userRows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const targetUser = userRows[0];

    if (!targetUser) {
      return NextResponse.json(apiError("User not found", 404), { status: 404 });
    }

    if (targetUser.role !== "admin") {
      return NextResponse.json(
        apiError("User is not an admin", 400),
        { status: 400 }
      );
    }

    const adminCountRows = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(eq(users.role, "admin"));

    const adminCount = Number(adminCountRows[0]?.count || 0);
    if (adminCount <= 1) {
      return NextResponse.json(
        apiError("Cannot demote the last admin", 400),
        { status: 400 }
      );
    }

    const updated = await db
      .update(users)
      .set({ role: "user", updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "DEMOTE_USER",
      resource: "user",
      resourceId: userId,
      details: JSON.stringify({
        from: targetUser.role,
        to: "user",
        email: targetUser.email,
      }),
    });

    return NextResponse.json(apiResponse(updated[0]));
  } catch (error) {
    console.error("Demote user error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
