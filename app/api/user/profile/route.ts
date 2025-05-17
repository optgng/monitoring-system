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
    logger.info(`Fetching profile for user ID: ${userId}`)

    // Try to use the session token if available
    const accessToken = session.accessToken as string

    try {
      // First attempt: Use the user's own token if available
      if (accessToken) {
        logger.info("Using session access token for profile fetch")
        const user = await keycloakService.getUserById(userId, accessToken)
        const { access, ...safeUserData } = user
        return NextResponse.json(safeUserData)
      }
    } catch (error) {
      logger.warn("Failed to fetch profile with session token, falling back to admin token", error)
    }

    // Second attempt: Use admin token
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
    const { firstName, lastName, email, attributes } = data

    logger.info(`Updating profile for user ID: ${userId}`, { firstName, lastName, email, attributes })

    // Create update object with only allowed fields
    const updateData = {
      firstName,
      lastName,
      email,
      attributes,
    }

    // Try to use the session token if available
    const accessToken = session.accessToken as string

    try {
      // First attempt: Use the user's own token if available
      if (accessToken) {
        logger.info("Using session access token for profile update")
        await keycloakService.updateUserProfile(userId, updateData, accessToken)
        return NextResponse.json({ success: true })
      }
    } catch (error) {
      logger.warn("Failed to update profile with session token, falling back to admin token", error)
    }

    // Second attempt: Use admin token
    await keycloakService.updateUserProfile(userId, updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error updating user profile", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
