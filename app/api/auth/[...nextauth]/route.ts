import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { jwtDecode } from "jose"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"

// Define the structure of the Keycloak token
interface KeycloakToken {
  exp: number
  iat: number
  auth_time: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  session_state: string
  acr: string
  realm_access: {
    roles: string[]
  }
  resource_access: {
    [key: string]: {
      roles: string[]
    }
  }
  scope: string
  sid: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
}

// NextAuth configuration options
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account && account.access_token) {
        // Decode the access token to get user roles
        const decoded = jwtDecode<KeycloakToken>(account.access_token)

        // Extract roles from the token
        const realmRoles = decoded.realm_access?.roles || []
        const resourceRoles = Object.values(decoded.resource_access || {}).flatMap((resource) => resource.roles || [])

        // Add roles and tokens to the JWT
        token.roles = [...realmRoles, ...resourceRoles]
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at * 1000
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      // Add user roles and ID to the session
      if (token) {
        session.user.roles = token.roles as string[]
        session.user.id = token.sub
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Function to refresh the access token
async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID || "",
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
    }
  } catch (error) {
    console.error("Error refreshing access token", error)

    // The error property will be used client-side to handle the refresh token error
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

// Create the NextAuth handler
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
