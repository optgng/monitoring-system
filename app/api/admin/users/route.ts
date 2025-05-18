import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// GET all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      logger.warn("Unauthorized access attempt to users API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || undefined
    const first = searchParams.get("first") ? Number.parseInt(searchParams.get("first") as string, 10) : undefined
    const max = searchParams.get("max") ? Number.parseInt(searchParams.get("max") as string, 10) : undefined

    logger.info("Fetching users", { search, first, max })

    const users = await keycloakService.getUsers(search, first, max)

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        try {
          const roles = await keycloakService.getUserRoles(user.id)
          return {
            ...user,
            roles: roles.realmMappings?.map((role: any) => role.name) || [],
          }
        } catch (error) {
          logger.error(`Error fetching roles for user ${user.id}`, error)
          return {
            ...user,
            roles: [],
          }
        }
      }),
    )

    return NextResponse.json(usersWithRoles)
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
      logger.warn("Unauthorized access attempt to create user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()

    // Validate input
    const { username, firstName, lastName, email, password, roles, attributes } = data

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    logger.info("Creating new user", { username, email })

    // Create user
    const userData: any = {
      username,
      firstName,
      lastName,
      email,
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
    }

    // Добавляем атрибуты, если они есть (например, phoneNumber)
    if (attributes && typeof attributes === "object") {
      userData.attributes = {}
      for (const key in attributes) {
        // Keycloak ожидает массив строк для каждого атрибута
        userData.attributes[key] = Array.isArray(attributes[key])
          ? attributes[key]
          : [attributes[key]]
      }
    }

    const userId = await keycloakService.createUser(userData)

    // Assign roles if provided
    if (roles && roles.length > 0) {
      for (const role of roles) {
        await keycloakService.assignRealmRoleToUser(userId, role)
      }
    }

    return NextResponse.json({ id: userId, success: true })
  } catch (error) {
    logger.error("Error creating user", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to create user" }, { status: 500 })
  }
}
