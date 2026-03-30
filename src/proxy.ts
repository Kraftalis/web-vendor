import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (middleware) for vendor.kraftalis.com.
 *
 * Responsibilities:
 * 1. Security headers on every response.
 * 2. Onboarding enforcement — logged-in vendors without the `bp` cookie
 *    are redirected to /onboarding. The `bp` cookie is set by Route Handlers
 *    (API routes) once the vendor completes all onboarding steps.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security headers ──────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // ─── Public routes — skip onboarding check ────────────────
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email");

  if (isPublicRoute) return response;

  // ─── Check session ────────────────────────────────────────
  const token =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!token;

  // We should also let the user through if they are completed in the database
  // but just lost their local bp cookie (e.g. after logout/login)
  // However, edge-side DB checks are slow.
  // A better way is to check the JWT if authjs is using it, but we can't easily decrypt it here
  // without jose or similar.

  if (!isLoggedIn) return response;

  // Remove existing onboarding cookie-based enforcement
  // Pengecekan onboarding dipindah ke root layout untuk akses database langsung.

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icons, sw.js, manifest
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|icons|sw\\.js|manifest).*)",
  ],
};
