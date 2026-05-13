import { NextRequest, NextResponse } from "next/server";
import { getPublicCheats, getAllCheats } from "@/lib/db/cheats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { isAdmin, apiError } from "@/lib/utils";

/**
 * GET /api/cheats
 * List cheats (public for non-admins, all for admins)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Admins see all cheats, others see public only
    const cheatsList = isAdmin(session?.user?.role)
      ? await getAllCheats()
      : await getPublicCheats();

    return NextResponse.json({
      success: true,
      data: cheatsList,
      count: cheatsList.length,
    });
  } catch (error) {
    console.error("Get cheats error:", error);
    return NextResponse.json(
      apiError("Internal server error", 500),
      { status: 500 }
    );
  }
}
