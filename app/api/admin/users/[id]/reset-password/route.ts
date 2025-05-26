import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// POST reset user password
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      logger.warn("Unauthorized access attempt to reset user password")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const resolvedParams = await params
    const userId = resolvedParams.id
    const data = await req.json()
    const { password, temporary = true } = data

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password is required and must be at least 8 characters long" },
        { status: 400 },
      )
    } logger.info(`Resetting password for user ${userId}`, { temporary })
    await keycloakService.updateUserPassword(userId, password, temporary)

    return NextResponse.json({ success: true })
  } catch (error) {
    const resolvedParams = await params
    logger.error(`Error resetting password for user ${resolvedParams.id}`, error)
    return NextResponse.json({ error: "Failed to reset user password" }, { status: 500 })
  }
}
