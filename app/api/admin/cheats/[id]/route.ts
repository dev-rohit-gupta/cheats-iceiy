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
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json(
        apiError("Unauthorized - Admin access required", 403),
        { status: 403 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        apiError("Invalid cheat ID", 400),
        { status: 400 }
      );
    }

    // Check if cheat exists
    const existingCheat = await getCheatById(id);
    if (!existingCheat) {
      return NextResponse.json(
        apiError("Cheat not found", 404),
        { status: 404 }
      );
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

    // Update cheat
    const updatedCheat = await updateCheat(id, validationResult.data);

    if (!updatedCheat) {
      return NextResponse.json(
        apiError("Failed to update cheat", 500),
        { status: 500 }
      );
    }

    // Log audit
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "update",
      resource: "cheat",
      resourceId: id,
      details: JSON.stringify(validationResult.data),
    });

    return NextResponse.json(
      apiResponse({
        success: true,
        message: "Cheat updated successfully",
        data: updatedCheat,
      })
    );
  } catch (error) {
    console.error("Update cheat error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cheats/[id]
 * Delete a cheat (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json(
        apiError("Unauthorized - Admin access required", 403),
        { status: 403 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        apiError("Invalid cheat ID", 400),
        { status: 400 }
      );
    }

    // Check if cheat exists
    const existingCheat = await getCheatById(id);
    if (!existingCheat) {
      return NextResponse.json(
        apiError("Cheat not found", 404),
        { status: 404 }
      );
    }

    // Delete cheat
    const deleted = await deleteCheat(id);

    if (!deleted) {
      return NextResponse.json(
        apiError("Failed to delete cheat", 500),
        { status: 500 }
      );
    }

    // Log audit
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "delete",
      resource: "cheat",
      resourceId: id,
      details: JSON.stringify({ title: existingCheat.title }),
    });

    return NextResponse.json({
      success: true,
      message: "Cheat deleted successfully",
    });
  } catch (error) {
    console.error("Delete cheat error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
