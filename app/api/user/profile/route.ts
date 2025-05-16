import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

// GET current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const user = await keycloakService.getUserById(userId)

    // Remove sensitive information
    const { access, ...safeUserData } = user

    return NextResponse.json(safeUserData)
  } catch (error) {
    logger.error("Error fetching user profile", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

// PUT update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await req.json()

    // Validate input
    const { firstName, lastName, email } = data

    // Create update object with only allowed fields
    const updateData = {
      firstName,
      lastName,
      email,
      // Add any other allowed fields here
    }

    await keycloakService.updateUserProfile(userId, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error updating user profile", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
