import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

// POST reset password
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to reset password")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    // In a real app, you would check for admin permissions here

    const userId = params.id
    const { password, temporary = false } = await req.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    logger.info(`Resetting password for user ${userId}`, { temporary })

    await keycloakService.updateUserPassword(userId, password, temporary)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error resetting password`, error)
    return NextResponse.json({ error: (error as Error).message || "Failed to reset password" }, { status: 500 })
  }
}
