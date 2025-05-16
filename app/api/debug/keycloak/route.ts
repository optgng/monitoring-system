import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { keycloakService } from "@/lib/keycloak-service"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get environment variables (redact sensitive info)
    const env = {
      KEYCLOAK_HOST: process.env.KEYCLOAK_HOST || "not set",
      KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER || "not set",
      KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || "not set",
      KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET ? "set (redacted)" : "not set",
    }

    // Get session info (redact sensitive info)
    const sessionInfo = {
      user: session.user,
      hasAccessToken: !!session.accessToken,
    }

    // Test admin token
    let adminTokenTest = "failed"
    try {
      await keycloakService.getAdminToken()
      adminTokenTest = "success"
    } catch (error) {
      adminTokenTest = `failed: ${(error as Error).message}`
    }

    // Test user profile fetch
    let userProfileTest = "failed"
    try {
      await keycloakService.getUserById(session.user.id)
      userProfileTest = "success"
    } catch (error) {
      userProfileTest = `failed: ${(error as Error).message}`
    }

    return NextResponse.json({
      env,
      sessionInfo,
      tests: {
        adminToken: adminTokenTest,
        userProfile: userProfileTest,
      },
    })
  } catch (error) {
    logger.error("Error in debug endpoint", error)
    return NextResponse.json({ error: "Debug failed" }, { status: 500 })
  }
}
