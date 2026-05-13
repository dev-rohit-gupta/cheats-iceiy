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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);

    const cheat = await getCheatById(numId);
    if (!cheat) {
      return NextResponse.json(apiError("Cheat not found", 404), { status: 404 });
    }

    const url = new URL(req.url);
    const shareCode = url.searchParams.get("code") ?? undefined;

    const { canAccess, reason } = await canAccessCheat(numId, shareCode);
    if (!canAccess) {
      return NextResponse.json(
        apiError(reason ?? "Access denied", 403),
        { status: 403 }
      );
    }

    return NextResponse.json({ data: cheat });
  } catch (error) {
    console.error("Error fetching cheat:", error);
    return NextResponse.json(apiError("Failed to fetch cheat", 500), { status: 500 });
  }
}
