import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const keycloakUrl = process.env.KEYCLOAK_ISSUER || ""

    if (!keycloakUrl) {
      return NextResponse.json({ status: "error", message: "Keycloak URL not configured" }, { status: 500 })
    }

    // Try to connect to Keycloak
    const response = await fetch(`${keycloakUrl}/.well-known/openid-configuration`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Failed to connect to Keycloak: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      status: "ok",
      message: "Successfully connected to Keycloak",
      issuer: data.issuer,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Keycloak health check failed", error)

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error connecting to Keycloak",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
