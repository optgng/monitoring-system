#!/usr/bin/env node

/**
 * This script checks if the Keycloak server is reachable
 * It can be used in CI/CD pipelines or as a pre-start check
 */

async function checkKeycloakConnection() {
  const keycloakUrl = process.env.KEYCLOAK_ISSUER || ""

  if (!keycloakUrl) {
    console.error("❌ KEYCLOAK_ISSUER environment variable is not set")
    process.exit(1)
  }

  console.log(`🔍 Checking connection to Keycloak at ${keycloakUrl}`)

  try {
    const response = await fetch(`${keycloakUrl}/.well-known/openid-configuration`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Failed with status: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ Successfully connected to Keycloak issuer: ${data.issuer}`)
    process.exit(0)
  } catch (error) {
    console.error(`❌ Failed to connect to Keycloak: ${error instanceof Error ? error.message : String(error)}`)

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("This appears to be a network connectivity issue. Please check:")
      console.error("1. Keycloak server is running")
      console.error("2. Network connectivity between this application and Keycloak")
      console.error("3. Firewall rules allow the connection")
      console.error("4. The KEYCLOAK_ISSUER URL is correct")
    }

    process.exit(1)
  }
}

checkKeycloakConnection().catch((error) => {
  console.error("Unexpected error:", error)
  process.exit(1)
})
