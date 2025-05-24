import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Проверяем наличие всех необходимых переменных окружения
    const requiredEnvVars = [
      "KEYCLOAK_CLIENT_ID",
      "KEYCLOAK_CLIENT_SECRET",
      "KEYCLOAK_ISSUER",
      "KEYCLOAK_HOST",
      "KEYCLOAK_REALM",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
    ]

    const envStatus = requiredEnvVars.reduce(
      (acc, varName) => {
        acc[varName] = {
          exists: !!process.env[varName],
          value: varName.includes("SECRET") ? "[HIDDEN]" : process.env[varName] || "[NOT SET]",
        }
        return acc
      },
      {} as Record<string, { exists: boolean; value: string }>,
    )

    // Проверяем доступность Keycloak
    let keycloakStatus = "unknown"
    try {
      if (process.env.KEYCLOAK_ISSUER) {
        const wellKnownUrl = `${process.env.KEYCLOAK_ISSUER}/.well-known/openid_configuration`
        const response = await fetch(wellKnownUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
        })
        keycloakStatus = response.ok ? "available" : "error"
      }
    } catch (error) {
      keycloakStatus = "unreachable"
    }

    return NextResponse.json({
      status: "ok",
      environment: process.env.NODE_ENV,
      envVars: envStatus,
      keycloak: {
        status: keycloakStatus,
        issuer: process.env.KEYCLOAK_ISSUER,
        realm: process.env.KEYCLOAK_REALM,
      },
      nextauth: {
        url: process.env.NEXTAUTH_URL,
        secret: process.env.NEXTAUTH_SECRET ? "[SET]" : "[NOT SET]",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Configuration check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
