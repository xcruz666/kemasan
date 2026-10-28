import { NextResponse, type NextRequest } from "next/server";
import { getAuthConfig } from "@/lib/auth/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Optimistic check only. Every admin page and Server Action also calls
 * requireAdmin(), so this is never the only line of defence.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/admin/login/") return NextResponse.next();

  const config = getAuthConfig();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (config && verifySessionToken(token, config.sessionSecret)) return NextResponse.next();

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
