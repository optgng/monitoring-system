import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

// GET all roles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to roles API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    // In a real app, you would check for admin permissions here

    logger.info("Fetching available roles")

    const roles = await keycloakService.getRealmRoles()

    return NextResponse.json(roles)
  } catch (error) {
    logger.error("Error fetching roles", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}
