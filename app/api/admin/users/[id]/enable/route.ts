import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

// POST enable/disable user
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to enable/disable user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    // In a real app, you would check for admin permissions here

    const userId = params.id
    const { enabled } = await req.json()

    // Prevent disabling yourself
    if (userId === session.user.id && enabled === false) {
      logger.warn(`User ${userId} attempted to disable their own account`)
      return NextResponse.json({ error: "Cannot disable your own account" }, { status: 400 })
    }

    logger.info(`Toggling user ${userId} enabled status to ${enabled}`)

    // Используем правильный метод из keycloakService
    await keycloakService.setUserEnabled(userId, enabled)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error toggling user ${params.id} status`, error)
    return NextResponse.json({ error: (error as Error).message || "Failed to update user status" }, { status: 500 })
  }
}
