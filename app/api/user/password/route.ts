import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

// POST update user password
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await req.json()

    // Validate input
    const { currentPassword, newPassword } = data

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 })
    }

    // Note: Keycloak doesn't provide a direct way to verify the current password
    // In a real implementation, you might need to use a different approach

    await keycloakService.updateUserPassword(userId, newPassword, false)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error updating user password", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
