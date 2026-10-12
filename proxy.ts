import { NextResponse } from "next/server";

/**
 * Authentication and authorization are deliberately enforced by the server
 * dashboard layout and each admin API handler, not by the proxy.
 *
 * NextAuth v4 can use differently prefixed session cookies between local HTTP
 * and hosted HTTPS requests. Reading the token independently in a proxy can
 * reject a legitimate session which getServerSession() recognizes.
 *
 * Keep this pass-through for existing deployments containing proxy.ts.
 * Do not put authorization logic here without also keeping the server checks.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/api/admin/:path*"] };
