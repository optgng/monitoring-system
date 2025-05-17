import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { logger } from "@/lib/logger"
import { keycloakService } from "@/lib/keycloak"
import { profileCache } from "@/lib/cache"

// PUT update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to update user profile")
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

    // Обновляем профиль пользователя
    await keycloakService.updateUserProfile(userId, updateData)
    logger.info(`Successfully updated profile for user ${userId}`)

    // Инвалидируем кэш после обновления
    profileCache.delete(userId)

    // Не обновляем сессию здесь, чтобы избежать циклов обновления
    // Пользователь может обновить страницу, чтобы увидеть изменения в хедере

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error updating user profile", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to update user profile" }, { status: 500 })
  }
}
