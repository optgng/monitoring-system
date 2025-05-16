import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService, type KeycloakUserCreate } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// GET all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const search = url.searchParams.get("search") || undefined
    const first = url.searchParams.get("first") ? Number.parseInt(url.searchParams.get("first")!) : undefined
    const max = url.searchParams.get("max") ? Number.parseInt(url.searchParams.get("max")!) : undefined

    const users = await keycloakService.getUsers(search, first, max)

    // Remove sensitive information
    const safeUsers = users.map(({ access, ...user }) => user)

    return NextResponse.json(safeUsers)
  } catch (error) {
    logger.error("Error fetching users", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST create a new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()

    // Validate input
    const { username, email, firstName, lastName, password, enabled = true, roles = [] } = data

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Create user object
    const newUser: KeycloakUserCreate = {
      username,
      email,
      firstName,
      lastName,
      enabled,
      emailVerified: false,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
    }

    // Create the user
    const userId = await keycloakService.createUser(newUser)

    // Assign roles if provided
    if (roles && roles.length > 0) {
      for (const role of roles) {
        await keycloakService.assignRealmRoleToUser(userId, role)
      }
    }

    return NextResponse.json({ id: userId, success: true })
  } catch (error) {
    logger.error("Error creating user", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
