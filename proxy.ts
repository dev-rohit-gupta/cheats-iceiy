import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET must be configured");
  const token = await getToken({ req: request, secret });
  const isAllowed = Boolean(token?.id && (token.role === "admin" || token.role === "super_admin"));
  if (!isAllowed) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Always enforce live DB roles in API handlers and server actions as well.
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/api/admin/:path*"] };
