import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
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

    // The initial setup endpoint cannot overwrite a password. Existing
    // password holders must use /api/auth/password/change with their old password.
    const passwordHash = await hashPassword(password);
    const updated = await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(and(eq(users.id, session.user.id), isNull(users.passwordHash)))
      .returning({ id: users.id });
    if (!updated.length) return NextResponse.json(apiError("Password already set. Use Change Password.", 409), { status: 409 });

    // Guard against simultaneous setup requests by using a conditional UPDATE.
    // A second call cannot change an already-set password.
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
