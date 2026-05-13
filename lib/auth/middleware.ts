import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { isAdmin } from "@/lib/utils";

/**
 * Admin route protection middleware
 * Checks if user has admin role
 */
export async function withAdminCheck(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  return null; // Allows request to continue
}

/**
 * User authentication check middleware
 */
export async function withAuthCheck(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized - Login required" },
      { status: 401 }
    );
  }

  return null; // Allows request to continue
}
