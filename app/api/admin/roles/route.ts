import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// GET all roles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      logger.warn("Unauthorized access attempt to roles API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    logger.info("Fetching all realm roles")
    const roles = await keycloakService.getRealmRoles()

    return NextResponse.json(roles)
  } catch (error) {
    logger.error("Error fetching realm roles", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}
