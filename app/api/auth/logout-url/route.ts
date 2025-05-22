import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Access ONLY server-side environment variables
    const keycloakHost = process.env.KEYCLOAK_HOST
    const realm = process.env.KEYCLOAK_REALM
    const issuer = process.env.KEYCLOAK_ISSUER

    // Get the redirect URI from the query parameters or use a default
    const url = new URL(request.url)
    const redirectUri = url.searchParams.get("redirectUri") || `${url.origin}/login`

    // Construct the logout URL
    let logoutUrl = "/login" // Default fallback

    if (keycloakHost && realm) {
      // Ensure host has /auth if needed for Keycloak 21+
      let hostWithAuth = keycloakHost
      if (!/\/auth$/.test(hostWithAuth)) {
        hostWithAuth = hostWithAuth.replace(/\/$/, "") + "/auth"
      }
      logoutUrl = `${hostWithAuth}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(redirectUri)}`
    } else if (issuer) {
      // Try to extract from issuer if available
      const match = issuer.match(/(https?:\/\/[^/]+)\/realms\/([^/]+)/)
      if (match) {
        const extractedHost = match[1].replace(/\/$/, "")
        const extractedRealm = match[2]

        let hostWithAuth = extractedHost
        if (!/\/auth$/.test(hostWithAuth)) {
          hostWithAuth = hostWithAuth.replace(/\/$/, "") + "/auth"
        }

        logoutUrl = `${hostWithAuth}/realms/${extractedRealm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(redirectUri)}`
      }
    }

    return NextResponse.json({ logoutUrl })
  } catch (error) {
    console.error("Error generating logout URL:", error)
    return NextResponse.json({ logoutUrl: "/login" }, { status: 500 })
  }
}
