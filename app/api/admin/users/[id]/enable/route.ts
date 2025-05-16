import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// POST enable/disable user
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const data = await req.json()

    // Validate input
    const { enabled } = data

    if (enabled === undefined) {
      return NextResponse.json({ error: "Enabled status is required" }, { status: 400 })
    }

    // Prevent disabling yourself
    if (userId === currentUser.id && !enabled) {
      return NextResponse.json({ error: "Cannot disable your own account" }, { status: 400 })
    }

    await keycloakService.setUserEnabled(userId, enabled)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error updating user status ${params.id}`, error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
