import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// POST toggle user enabled status
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      logger.warn("Unauthorized access attempt to toggle user status")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const data = await req.json()
    const { enabled } = data

    // Prevent disabling your own account
    if (userId === currentUser.id && enabled === false) {
      logger.warn(`User ${currentUser.id} attempted to disable their own account`)
      return NextResponse.json({ error: "Cannot disable your own account" }, { status: 400 })
    }

    logger.info(`Toggling user ${userId} enabled status to ${enabled}`)
    await keycloakService.updateUserStatus(userId, enabled)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error toggling user ${params.id} status`, error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
