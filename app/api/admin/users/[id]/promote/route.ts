import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { getCurrentSuperAdmin } from "@/lib/auth/permissions";
import { apiError, apiResponse } from "@/lib/utils";
import { eq, sql, and } from "drizzle-orm";

/**
 * POST /api/admin/users/[id]/promote
 * Promote user to admin (super admin only)
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const actor = await getCurrentSuperAdmin();

    if (!actor) {
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

    const userRows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const targetUser = userRows[0];

    if (!targetUser) {
      return NextResponse.json(apiError("User not found", 404), { status: 404 });
    }

    if (targetUser.role !== "user") {
      return NextResponse.json(
        apiError("User is already an admin", 400),
        { status: 400 }
      );
    }

    if (!targetUser.passwordHash) {
      return NextResponse.json(apiError("The user must set a password before being promoted", 409), { status: 409 });
    }

    const updated = await db
      .update(users)
      .set({ role: "admin", authVersion: sql`${users.authVersion} + 1`, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.role, "user")))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    if (!updated.length) return NextResponse.json(apiError("User role changed concurrently", 409), { status: 409 });

    await db.insert(auditLogs).values({
      adminId: actor.id,
      action: "PROMOTE_USER",
      resource: "user",
      resourceId: userId,
      details: JSON.stringify({
        from: targetUser.role,
        to: "admin",
        email: targetUser.email,
      }),
    });

    return NextResponse.json(apiResponse(updated[0]));
  } catch (error) {
    console.error("Promote user error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
