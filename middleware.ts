import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ["/admin", "/profile", "/my-numbers"]

  // Admin-only routes
  const adminRoutes = ["/admin"]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token =
      request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.redirect(new URL("/?auth=required", request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL("/?auth=invalid", request.url))
    }

    // Check admin access for admin routes
    if (isAdminRoute && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/?auth=forbidden", request.url))
    }

    // Add user info to headers for use in API routes
    const response = NextResponse.next()
    response.headers.set("x-user-id", decoded.id.toString())
    response.headers.set("x-user-role", decoded.role)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
