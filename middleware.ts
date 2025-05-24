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
const publicRoutes = [
  "/login",
  "/auth",
  "/api/auth", // Важно: все NextAuth API routes должны быть публичными
  "/api/health",
  "/unauthorized",
  "/_next",
  "/favicon.ico",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`Middleware triggered for path: ${pathname}`)

  // Пропускаем все API routes NextAuth без проверки
  if (pathname.startsWith("/api/auth/")) {
    console.log(`Allowing NextAuth API route: ${pathname}`)
    return NextResponse.next()
  }

  // Пропускаем статические файлы и другие системные пути
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/health") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    console.log(`Public route allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Get the token from the session
  let token
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
  } catch (error) {
    console.error("Error getting token:", error)
    // Если не можем получить токен, перенаправляем на логин
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If there's no token and the route is not public, redirect to login
  if (!token) {
    console.log(`No token found, redirecting to login for: ${pathname}`)
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
      console.log(`Access denied for ${pathname}, user roles: ${userRoles.join(", ")}`)
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  console.log(`Access granted for: ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth API routes) - исключаем из matcher
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
