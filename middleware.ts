import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define routes that require authentication and their required roles
const protectedRoutes = [
  { path: "/dashboards", roles: ["user", "manager", "admin", "support"] },
  { path: "/devices", roles: ["admin"] },
  { path: "/users", roles: ["admin"] },
  { path: "/notifications", roles: ["admin"] },
  { path: "/reports", roles: ["manager", "admin"] },
  { path: "/alerts", roles: ["admin"] },
]

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/auth", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`Middleware triggered for path: ${pathname}`) // Логирование маршрута

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If there's no token and the route is not public, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Check if the route is protected and requires specific roles
  const protectedRoute = protectedRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
  )

  if (protectedRoute) {
    const userRoles = (token.roles as string[]) || []

    // Check if the user has the required role
    const hasRequiredRole = protectedRoute.roles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or home page
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
