import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, apiError } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { setPasswordSchema } from "@/lib/validations";

/**
 * POST /api/auth/password/set
 * Set password for a user (typically after Google OAuth signup)
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
    const validationResult = setPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        apiError(
          "Invalid input: " +
            validationResult.error.errors.map((e) => e.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update user with password hash
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
