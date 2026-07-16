import { type NextRequest, NextResponse } from "next/server";

/** Routes that require authentication. */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Auth pages — authenticated users should not land here. */
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookies (set by the app) OR from the Authorization header.
  // Next.js middleware cannot read localStorage, so we rely on a cookie named
  // "auth_token" that the AuthProvider sets via document.cookie on the client.
  // The fallback keeps the dev experience smooth when cookies are not yet set.
  const token =
    request.cookies.get("auth_token")?.value ??
    request.headers.get("Authorization")?.replace("Bearer ", "") ??
    null;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Redirect unauthenticated visitors away from protected pages
  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated visitors away from login/register
  if (isAuthRoute && token) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except static files, images, and Next.js internals
  matcher: ["/((?!_next|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)).*)"],
};
