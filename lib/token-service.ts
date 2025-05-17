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

// Кэш для декодированных токенов
const tokenCache = new Map<string, { decoded: DecodedToken; timestamp: number }>()
// Время жизни кэша - 1 минута
const TOKEN_CACHE_TTL = 60 * 1000

export class TokenService {
  /**
   * Декодирует JWT токен с использованием кэша
   * @param token JWT токен для декодирования
   * @returns Декодированный токен или null в случае ошибки
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      // Проверяем, есть ли токен в кэше
      const cachedToken = tokenCache.get(token)
      const now = Date.now()

      if (cachedToken && now - cachedToken.timestamp < TOKEN_CACHE_TTL) {
        return cachedToken.decoded
      }

      // Если токена нет в кэше или он устарел, декодируем заново
      const decoded = decodeJwt(token) as DecodedToken

      // Сохраняем в кэш
      tokenCache.set(token, { decoded, timestamp: now })

      // Очищаем старые записи из кэша, если их больше 100
      if (tokenCache.size > 100) {
        const oldestKey = [...tokenCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
        tokenCache.delete(oldestKey)
      }

      return decoded
    } catch (error) {
      logger.error("Failed to decode token", error)
      return null
    }
  }

  /**
   * Извлекает роли из декодированного токена
   * @param decodedToken Декодированный токен
   * @returns Массив ролей
   */
  static extractRoles(decodedToken: DecodedToken | null): string[] {
    if (!decodedToken) return []

    const realmRoles = decodedToken.realm_access?.roles || []
    const resourceRoles = Object.values(decodedToken.resource_access || {}).flatMap((resource) => resource.roles || [])

    return [...realmRoles, ...resourceRoles]
  }

  /**
   * Проверяет, истек ли срок действия токена
   * @param decodedToken Декодированный токен
   * @returns true, если токен истек, иначе false
   */
  static isTokenExpired(decodedToken: DecodedToken | null): boolean {
    if (!decodedToken || !decodedToken.exp) return true

    // exp в секундах, Date.now() в миллисекундах
    const currentTime = Math.floor(Date.now() / 1000)
    return decodedToken.exp < currentTime
  }

  /**
   * Вычисляет оставшееся время до истечения срока действия токена
   * @param decodedToken Декодированный токен
   * @returns Время в секундах до истечения срока действия или 0, если токен истек или недействителен
   */
  static getTokenExpiryTime(decodedToken: DecodedToken | null): number {
    if (!decodedToken || !decodedToken.exp) return 0

    const currentTime = Math.floor(Date.now() / 1000)
    const timeRemaining = decodedToken.exp - currentTime

    return timeRemaining > 0 ? timeRemaining : 0
  }

  /**
   * Очищает кэш токенов
   */
  static clearCache(): void {
    tokenCache.clear()
  }
}
