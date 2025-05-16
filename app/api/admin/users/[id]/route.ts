import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"
import { hasPermission, getCurrentUser } from "@/lib/auth"

// GET user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const user = await keycloakService.getUserById(userId)

    // Remove sensitive information
    const { access, ...safeUserData } = user

    return NextResponse.json(safeUserData)
  } catch (error) {
    logger.error(`Error fetching user ${params.id}`, error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const data = await req.json()

    // Validate input
    const { firstName, lastName, email, enabled, emailVerified } = data

    // Create update object
    const updateData = {
      firstName,
      lastName,
      email,
      enabled,
      emailVerified,
    }

    await keycloakService.updateUserProfile(userId, updateData)

    // Handle role updates if provided
    if (data.roles) {
      // Get current roles
      const currentRoles = await keycloakService.getUserRoles(userId)
      const currentRealmRoles = currentRoles.realmMappings || []

      // Determine roles to add and remove
      const currentRoleNames = currentRealmRoles.map((r: any) => r.name)
      const rolesToAdd = data.roles.filter((r: string) => !currentRoleNames.includes(r))
      const rolesToRemove = currentRoleNames.filter((r: string) => !data.roles.includes(r))

      // Add new roles
      for (const role of rolesToAdd) {
        await keycloakService.assignRealmRoleToUser(userId, role)
      }

      // Remove roles
      for (const role of rolesToRemove) {
        await keycloakService.removeRealmRoleFromUser(userId, role)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error updating user ${params.id}`, error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser, "manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id

    // Prevent deleting yourself
    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await keycloakService.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error deleting user ${params.id}`, error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
