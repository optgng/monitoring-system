import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Проверяем наличие необходимых переменных окружения
    const requiredEnvVars = [
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "KEYCLOAK_CLIENT_ID",
      "KEYCLOAK_CLIENT_SECRET",
      "KEYCLOAK_ISSUER",
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing environment variables",
          missing: missingVars,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "NextAuth configuration is valid",
      config: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        keycloakIssuer: process.env.KEYCLOAK_ISSUER,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasClientId: !!process.env.KEYCLOAK_CLIENT_ID,
        hasClientSecret: !!process.env.KEYCLOAK_CLIENT_SECRET,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check NextAuth configuration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
