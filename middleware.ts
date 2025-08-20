import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/verify", "/reset","/forgot"];

  // Allow public routes, static files, and API routes
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") || // Next.js static files
    pathname.startsWith("/api") || // API routes
    pathname.startsWith("/favicon.ico") // Favicon
  ) {
    return NextResponse.next();
  }

  // Redirect to login if no accessToken
  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the requested path for post-login redirect
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - api routes (optional, included in middleware logic)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};