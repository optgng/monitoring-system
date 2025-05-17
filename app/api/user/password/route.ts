import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to change password")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    logger.info(`Attempting to change password for user ${userId}`)

    // Verify current password by attempting to get a token
    try {
      await keycloakService.verifyPassword(session.user.email || "", currentPassword)
    } catch (error) {
      logger.warn(`Invalid current password for user ${userId}`)
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    await keycloakService.updateUserPassword(userId, newPassword, false)
    logger.info(`Successfully changed password for user ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error changing password", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to change password" }, { status: 500 })
  }
}
