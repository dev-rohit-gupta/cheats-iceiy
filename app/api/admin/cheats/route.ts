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

    // Create cheat - convert undefined to null for optional fields
    const cheat = await createCheat({
      title: data.title,
      driveLink: data.driveLink,
      subject: data.subject,
      adminId: session.user.id,
      branch: data.branch ?? null,
      notes: data.notes ?? null,
      accessLevel: data.accessLevel,
      status: 'active',
      tags: data.tags ?? null,
    });

    // Log audit entry
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: 'CREATE_CHEAT',
      resource: 'cheat',
      resourceId: cheat.id,
      details: JSON.stringify(cheat),
    });

    return NextResponse.json(apiResponse(cheat), { status: 201 });
  } catch (error) {
    console.error("Error creating cheat:", error);
    return NextResponse.json(
      apiError("Failed to create cheat", 500),
      { status: 500 }
    );
  }
}
