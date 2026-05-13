import { NextRequest, NextResponse } from "next/server";
import { createCheat } from "@/lib/db/cheats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import {
  isAdmin,
  apiError,
  apiResponse,
} from "@/lib/utils";
import { createCheatSchema } from "@/lib/validations";
import { auditLogs } from "@/lib/db/schema";
import { db } from "@/lib/db";

/**
 * POST /api/admin/cheats
 * Create a new cheat (admin only)
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
    const validationResult = createCheatSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        apiError(
          "Invalid input: " +
            validationResult.error.errors.map((e) => e.message).join(", ")
        ),
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create cheat
    const cheat = await createCheat({
      ...data,
      adminId: session.user.id,
    });

    // Log audit
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "create",
      resource: "cheat",
      resourceId: cheat.id,
      details: JSON.stringify({
        title: cheat.title,
        subject: cheat.subject,
        accessLevel: cheat.accessLevel,
      }),
    });

    return NextResponse.json(
      apiResponse({
        success: true,
        message: "Cheat created successfully",
        data: cheat,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Create cheat error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
