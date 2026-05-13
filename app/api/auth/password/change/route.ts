import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  apiError,
} from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { changePasswordSchema } from "@/lib/validations";

/**
 * POST /api/auth/password/change
 * Change password for authenticated user
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        apiError("Unauthorized", 401),
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        apiError(
          "Invalid input: " +
            validationResult.error.errors.map((e) => e.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        apiError("User not found or password not set", 404),
        { status: 404 }
      );
    }

    // Verify current password
    const passwordValid = await verifyPassword(
      currentPassword,
      user.passwordHash
    );
    if (!passwordValid) {
      return NextResponse.json(
        apiError("Current password is incorrect", 401),
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
