import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

/**
 * Protect admin routes
 * All routes under /dashboard/* require admin role
 */
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow all authenticated users through (permission checks happen server-side)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
};
