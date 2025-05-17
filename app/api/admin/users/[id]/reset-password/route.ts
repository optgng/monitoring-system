import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// POST reset user password
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      logger.warn("Unauthorized access attempt to reset user password")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const data = await req.json()
    const { password, temporary = true } = data

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password is required and must be at least 8 characters long" },
        { status: 400 },
      )
    }

    logger.info(`Resetting password for user ${userId}`, { temporary })
    await keycloakService.resetUserPassword(userId, password, temporary)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error resetting password for user ${params.id}`, error)
    return NextResponse.json({ error: "Failed to reset user password" }, { status: 500 })
  }
}
