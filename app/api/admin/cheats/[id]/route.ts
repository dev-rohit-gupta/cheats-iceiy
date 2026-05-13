import { NextRequest, NextResponse } from "next/server";
import { updateCheat, deleteCheat, getCheatById } from "@/lib/db/cheats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import {
  isAdmin,
  apiError,
  apiResponse,
} from "@/lib/utils";
import { updateCheatSchema } from "@/lib/validations";
import { auditLogs } from "@/lib/db/schema";
import { db } from "@/lib/db";

/**
 * PATCH /api/admin/cheats/[id]
 * Update a cheat (admin only)
 */
export async function PATCH(
  req: NextRequest,
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
    const cheatId = parseInt(id, 10);
    if (isNaN(cheatId)) {
      return NextResponse.json(apiError("Invalid cheat ID", 400), { status: 400 });
    }

    const existingCheat = await getCheatById(cheatId);
    if (!existingCheat) {
      return NextResponse.json(apiError("Cheat not found", 404), { status: 404 });
    }

    const body = await req.json();
    const validationResult = updateCheatSchema.safeParse(body);

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
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.driveLink !== undefined) updateData.driveLink = data.driveLink;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.branch !== undefined) updateData.branch = data.branch ?? null;
    if (data.notes !== undefined) updateData.notes = data.notes ?? null;
    if (data.accessLevel !== undefined) updateData.accessLevel = data.accessLevel;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = data.tags ?? null;

    const cheat = await updateCheat(cheatId, updateData);

    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: 'UPDATE_CHEAT',
      resource: 'cheat',
      resourceId: cheatId,
      details: JSON.stringify(updateData),
    });

    return NextResponse.json(apiResponse(cheat));
  } catch (error) {
    console.error("Error updating cheat:", error);
    return NextResponse.json(apiError("Failed to update cheat", 500), { status: 500 });
  }
}

/**
 * DELETE /api/admin/cheats/[id]
 * Delete a cheat (admin only)
 */
export async function DELETE(
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
    const cheatId = parseInt(id, 10);
    if (isNaN(cheatId)) {
      return NextResponse.json(apiError("Invalid cheat ID", 400), { status: 400 });
    }

    const existingCheat = await getCheatById(cheatId);
    if (!existingCheat) {
      return NextResponse.json(apiError("Cheat not found", 404), { status: 404 });
    }

    await deleteCheat(cheatId);

    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: 'DELETE_CHEAT',
      resource: 'cheat',
      resourceId: cheatId,
      details: JSON.stringify({ deleted: true }),
    });

    return NextResponse.json(apiResponse({ success: true }));
  } catch (error) {
    console.error("Error deleting cheat:", error);
    return NextResponse.json(apiError("Failed to delete cheat", 500), { status: 500 });
  }
}
