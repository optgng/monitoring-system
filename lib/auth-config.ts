import KeycloakProvider from "next-auth/providers/keycloak"
import { decodeJwt } from "jose"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { logger } from "@/lib/logger"

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

// Function to refresh the access token
async function refreshAccessToken(token: JWT) {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available")
    }

    // Устанавливаем метку времени начала обновления токена
    const refreshStartTime = Date.now()
    token.lastTokenRefresh = refreshStartTime

    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`

    logger.debug("Refreshing token", { tokenId: token.jti })

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
      logger.error("Error refreshing access token", refreshedTokens)
      throw refreshedTokens
    }

    // Проверяем, не было ли другого успешного обновления токена пока мы ждали
    if (token.lastTokenRefresh !== refreshStartTime) {
      logger.debug("Another refresh completed while this was in progress, using that token instead")
      return token
    }

    logger.debug("Token refreshed successfully", { expires_in: refreshedTokens.expires_in })

    // Decode the new access token to get updated roles
    let roles = (token.roles as string[]) || []
    try {
      const decoded = decodeJwt(refreshedTokens.access_token) as KeycloakToken
      const realmRoles = decoded.realm_access?.roles || []
      const resourceRoles = Object.values(decoded.resource_access || {}).flatMap((resource) => resource.roles || [])
      roles = [...realmRoles, ...resourceRoles]
    } catch (error) {
      logger.error("Error decoding refreshed token", error)
      // Keep the existing roles if decoding fails
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      roles: roles,
      lastTokenRefresh: Date.now(),
    }
  } catch (error) {
    logger.error("Error refreshing access token", error)

    // The error property will be used client-side to handle the refresh token error
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

// NextAuth configuration options
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "",
      // Add timeout configuration
      httpOptions: {
        timeout: 10000, // 10 seconds timeout
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        // Decode the access token to get user roles
        try {
          const decoded = decodeJwt(account.access_token as string) as KeycloakToken

          // Extract roles from both realm and resource access
          const realmRoles = decoded.realm_access?.roles || []
          const resourceRoles = Object.values(decoded.resource_access || {}).flatMap((resource) => resource.roles || [])
          const allRoles = [...realmRoles, ...resourceRoles]

          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.accessTokenExpires = (decoded.exp || 0) * 1000
          token.roles = allRoles
          token.id = decoded.sub
          token.username = decoded.preferred_username

          // Сохраняем время последнего обновления токена
          token.lastTokenRefresh = Date.now()

          logger.debug("Initial token setup", {
            expiresAt: new Date(token.accessTokenExpires as number).toISOString(),
            rolesCount: token.roles.length,
          })

          return token
        } catch (error) {
          logger.error("Error decoding JWT token", error)
          // Continue with the token we have
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Проверяем, не обновлялся ли токен недавно (в течение последних 10 секунд)
      // Это предотвращает множественные попытки обновления токена в случае параллельных запросов
      if (token.lastTokenRefresh && Date.now() - (token.lastTokenRefresh as number) < 10000) {
        logger.debug("Token refresh skipped - recently refreshed")
        return token
      }

      // Access token has expired, try to refresh it
      logger.debug("Token expired, attempting refresh")
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      // Add user roles and ID to the session
      if (token) {
        session.user.roles = (token.roles as string[]) || []
        session.user.id = token.id || ""
        session.user.username = token.username
        session.accessToken = token.accessToken
        session.error = token.error as string | undefined

        // Добавляем информацию о сроке действия токена
        if (token.accessTokenExpires) {
          session.expires = new Date(token.accessTokenExpires as number).toISOString()
        }
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
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      logger.error(code, metadata)
    },
    warn: (code) => {
      logger.warn(code)
    },
    debug: (code, metadata) => {
      logger.debug(code, metadata)
    },
  },
}
