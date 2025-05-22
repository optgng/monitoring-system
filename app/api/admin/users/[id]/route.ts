import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

// GET user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    // In a real app, you would check for admin permissions here

    const userId = params.id
    const user = await keycloakService.getUserById(userId)

    // Преобразуем phoneNumber из attributes в отдельное поле для удобства фронта
    let phone = ""
    if (user.attributes && user.attributes.phoneNumber && Array.isArray(user.attributes.phoneNumber)) {
      phone = user.attributes.phoneNumber[0]
    }

    return NextResponse.json({ ...user, phone })
  } catch (error) {
    logger.error(`Error fetching user ${params.id}`, error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    // In a real app, you would check for admin permissions here

    const userId = params.id
    const data = await req.json()

    // Validate input
    const { firstName, lastName, email, enabled, roles, attributes } = data

    logger.info(`Updating user ${userId}`, { firstName, lastName, email, enabled, roles, attributes })

    // Формируем объект атрибутов для Keycloak
    let kcAttributes: Record<string, string[]> | undefined = undefined
    if (attributes && typeof attributes === "object") {
      kcAttributes = {}
      for (const key in attributes) {
        kcAttributes[key] = Array.isArray(attributes[key]) ? attributes[key] : [attributes[key]]
      }
    }

    // Update user profile
    await keycloakService.updateUserProfile(userId, {
      firstName,
      lastName,
      email,
      enabled,
      emailVerified: true,
      attributes: kcAttributes,
    })

    // Update roles if provided
    if (roles && roles.length > 0) {
      // Получаем текущие роли пользователя
      const userRoles = await keycloakService.getUserRoles(userId)
      const currentRoles = userRoles.realmMappings?.map((role: any) => role.name) || []

      // Получаем все доступные роли
      const allRoles = await keycloakService.getRealmRoles()
      const availableRoleNames = allRoles.map((role: any) => role.name)

      // Фильтруем роли, которые нужно добавить и удалить
      const rolesToAdd = roles.filter(
        (role: string) => !currentRoles.includes(role) && availableRoleNames.includes(role),
      )
      const rolesToRemove = currentRoles.filter(
        (role: string) => !roles.includes(role) && availableRoleNames.includes(role),
      )

      // Добавляем новые роли
      for (const role of rolesToAdd) {
        logger.info(`Assigning role ${role} to user ${userId}`)
        await keycloakService.assignRealmRoleToUser(userId, role)
      }

      // Удаляем старые роли
      for (const role of rolesToRemove) {
        logger.info(`Removing role ${role} from user ${userId}`)
        await keycloakService.removeRealmRoleFromUser(userId, role)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error updating user ${params.id}`, error)
    return NextResponse.json({ error: (error as Error).message || "Failed to update user" }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    // In a real app, you would check for admin permissions here

    const userId = params.id

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await keycloakService.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error deleting user ${params.id}`, error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
