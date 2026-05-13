import { NextRequest, NextResponse } from "next/server";
import { middleware } from "next-auth/middleware";

/**
 * Protect admin routes
 * All routes under /dashboard/* require admin role
 */
export async function auth(request: NextRequest) {
  return middleware(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
};
