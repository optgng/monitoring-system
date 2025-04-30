import { decodeJwt } from "jose"
import { logger } from "./logger"

interface DecodedToken {
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
  realm_access?: {
    roles: string[]
  }
  resource_access?: {
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

export class TokenService {
  /**
   * Decodes a JWT token
   * @param token The JWT token to decode
   * @returns The decoded token or null if decoding fails
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      return decodeJwt(token) as DecodedToken
    } catch (error) {
      logger.error("Failed to decode token", error)
      return null
    }
  }

  /**
   * Extracts roles from a decoded token
   * @param decodedToken The decoded token
   * @returns Array of roles
   */
  static extractRoles(decodedToken: DecodedToken | null): string[] {
    if (!decodedToken) return []

    const realmRoles = decodedToken.realm_access?.roles || []
    const resourceRoles = Object.values(decodedToken.resource_access || {}).flatMap((resource) => resource.roles || [])

    return [...realmRoles, ...resourceRoles]
  }

  /**
   * Checks if a token is expired
   * @param decodedToken The decoded token
   * @returns True if the token is expired, false otherwise
   */
  static isTokenExpired(decodedToken: DecodedToken | null): boolean {
    if (!decodedToken || !decodedToken.exp) return true

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000)
    return decodedToken.exp < currentTime
  }

  /**
   * Calculates the remaining time until a token expires
   * @param decodedToken The decoded token
   * @returns Time in seconds until expiration, or 0 if the token is expired or invalid
   */
  static getTokenExpiryTime(decodedToken: DecodedToken | null): number {
    if (!decodedToken || !decodedToken.exp) return 0

    const currentTime = Math.floor(Date.now() / 1000)
    const timeRemaining = decodedToken.exp - currentTime

    return timeRemaining > 0 ? timeRemaining : 0
  }
}
