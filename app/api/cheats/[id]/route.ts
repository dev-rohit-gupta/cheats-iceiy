import { NextRequest, NextResponse } from "next/server";
import { getCheatById } from "@/lib/db/cheats";
import { canAccessCheat } from "@/lib/auth/accessControl";
import { apiError } from "@/lib/utils";

/**
 * GET /api/cheats/[id]
 * Get cheat by ID (with access checking)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        apiError("Invalid cheat ID", 400),
        { status: 400 }
      );
    }

    const cheat = await getCheatById(id);

    if (!cheat) {
      return NextResponse.json(
        apiError("Cheat not found", 404),
        { status: 404 }
      );
    }

    // Get share code from query params if provided
    const shareCode = req.nextUrl.searchParams.get("code");

    // Check access
    const { canAccess, reason } = await canAccessCheat(id, shareCode || undefined);

    if (!canAccess) {
      return NextResponse.json(
        apiError(reason || "Unauthorized", 403),
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cheat,
    });
  } catch (error) {
    console.error("Get cheat error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
