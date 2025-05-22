import { logger } from "./logger"

// Define types for Keycloak API responses and requests
export interface KeycloakUser {
  id: string
  username: string
  firstName?: string
  lastName?: string
  email?: string
  enabled: boolean
  emailVerified: boolean
  attributes?: Record<string, string[]>
  requiredActions?: string[]
  access?: {
    manageGroupMembership: boolean
    view: boolean
    mapRoles: boolean
    impersonate: boolean
    manage: boolean
  }
  createdTimestamp?: number
  roles?: string[]
}

export interface KeycloakUserCreate {
  username: string
  email: string
  firstName?: string
  lastName?: string
  enabled?: boolean
  emailVerified?: boolean
  attributes?: Record<string, string[]>
  requiredActions?: string[]
  credentials?: {
    type: string
    value: string
    temporary: boolean
  }[]
}

export interface KeycloakUserUpdate {
  firstName?: string
  lastName?: string
  email?: string
  attributes?: Record<string, string[]>
  requiredActions?: string[]
  enabled?: boolean
  emailVerified?: boolean
}

export interface KeycloakError {
  error: string
  error_description: string
}

export class KeycloakService {
  private readonly keycloakHost: string
  private readonly realm: string
  private readonly clientId: string
  private readonly clientSecret: string
  private adminToken: string | null = null
  private adminTokenExpiry = 0

  constructor() {
    this.keycloakHost = process.env.KEYCLOAK_HOST || ""
    // Extract realm from the issuer URL
    const issuerUrl = process.env.KEYCLOAK_ISSUER || ""
    this.realm = issuerUrl.split("/realms/")[1] || "monitoring"
    this.clientId = process.env.KEYCLOAK_CLIENT_ID || ""
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || ""

    logger.info(`Initialized KeycloakService with realm: ${this.realm}, clientId: ${this.clientId}`)
  }

  /**
   * Get an admin token for Keycloak API operations
   */
  private async getAdminToken(): Promise<string> {
    // Check if we have a valid token
    if (this.adminToken && Date.now() < this.adminTokenExpiry) {
      return this.adminToken
    }

    try {
      // IMPORTANT: Use the monitoring realm for token endpoint, not master realm
      const tokenUrl = `${this.keycloakHost}/realms/${this.realm}/protocol/openid-connect/token`

      logger.info(`Requesting admin token from: ${tokenUrl}`)

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error("Failed to get admin token", {
          status: response.status,
          statusText: response.statusText,
          error,
        })
        throw new Error(`Failed to get admin token: ${error.error_description || error.error || "Unknown error"}`)
      }

      const data = await response.json()
      this.adminToken = data.access_token
      // Set expiry to slightly before the actual expiry to avoid edge cases
      this.adminTokenExpiry = Date.now() + (data.expires_in - 60) * 1000

      logger.info("Successfully obtained admin token")

      return this.adminToken
    } catch (error) {
      logger.error("Error getting admin token", error)
      throw new Error(`Failed to get admin token: ${(error as Error).message}`)
    }
  }

  /**
   * Verify a user's password by attempting to get a token
   */
  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      const tokenUrl = `${this.keycloakHost}/realms/${this.realm}/protocol/openid-connect/token`

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.warn("Password verification failed", {
          username,
          error: error.error_description || error.error,
        })
        return false
      }

      return true
    } catch (error) {
      logger.error("Error verifying password", error)
      return false
    }
  }

  /**
   * Make an authenticated request to the Keycloak API
   */
  private async makeRequest<T>(endpoint: string, method = "GET", body?: any, userToken?: string): Promise<T> {
    try {
      // Determine which token to use
      let token: string

      if (userToken) {
        // Use the provided user token
        token = userToken
        logger.info(`Using provided user token for request to ${endpoint}`)
      } else {
        // Get admin token
        token = await this.getAdminToken()
        logger.info(`Using admin token for request to ${endpoint}`)
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const options: RequestInit = {
        method,
        headers,
      }

      if (body && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(body)
      }

      // IMPORTANT: Use the correct realm for admin API endpoints
      const url = `${this.keycloakHost}/admin/realms/${this.realm}${endpoint}`

      logger.info(`Making ${method} request to: ${url}`)

      const response = await fetch(url, options)

      // Handle non-OK responses
      if (!response.ok) {
        let errorData: KeycloakError
        try {
          // Попытка распарсить JSON, если есть тело
          const text = await response.text()
          errorData = text
            ? JSON.parse(text)
            : {
                error: `HTTP Error ${response.status}`,
                error_description: response.statusText,
              }
        } catch (e) {
          errorData = {
            error: `HTTP Error ${response.status}`,
            error_description: response.statusText,
          }
        }

        logger.error(`Keycloak API error: ${errorData.error}`, {
          status: response.status,
          endpoint,
          errorData,
        })
        throw new Error(errorData.error_description || errorData.error || "Unknown error")
      }

      // Return empty object for 204 No Content
      if (response.status === 204) {
        return {} as T
      }

      // Безопасный парсинг JSON-ответа (если тело пустое, вернуть {})
      const text = await response.text()
      if (!text) return {} as T
      return JSON.parse(text)
    } catch (error) {
      logger.error(`Error in Keycloak API request to ${endpoint}`, error)
      throw error
    }
  }

  // User Profile Management

  /**
   * Get user by ID
   */
  async getUserById(userId: string, userToken?: string): Promise<KeycloakUser> {
    return this.makeRequest<KeycloakUser>(`/users/${userId}`, "GET", undefined, userToken)
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<KeycloakUser | null> {
    const users = await this.makeRequest<KeycloakUser[]>(`/users?username=${encodeURIComponent(username)}`)
    return users.length > 0 ? users[0] : null
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<KeycloakUser | null> {
    const users = await this.makeRequest<KeycloakUser[]>(`/users?email=${encodeURIComponent(email)}`)
    return users.length > 0 ? users[0] : null
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, userData: KeycloakUserUpdate, userToken?: string): Promise<void> {
    return this.makeRequest<void>(`/users/${userId}`, "PUT", userData, userToken)
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId: string, password: string, temporary = false): Promise<void> {
    return this.makeRequest<void>(`/users/${userId}/reset-password`, "PUT", {
      type: "password",
      value: password,
      temporary,
    })
  }

  // User Administration

  /**
   * Get all users
   */
  async getUsers(search?: string, first?: number, max?: number): Promise<KeycloakUser[]> {
    let endpoint = "/users"
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (first !== undefined) params.append("first", first.toString())
    if (max !== undefined) params.append("max", max.toString())

    const queryString = params.toString()
    if (queryString) endpoint += `?${queryString}`

    return this.makeRequest<KeycloakUser[]>(endpoint)
  }

  /**
   * Create a new user
   */
  async createUser(userData: KeycloakUserCreate): Promise<string> {
    await this.makeRequest<void>("/users", "POST", userData)

    // Keycloak doesn't return the user ID on creation, so we need to fetch it
    const user = await this.getUserByUsername(userData.username)
    if (!user) {
      throw new Error("User was created but could not be retrieved")
    }

    return user.id
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    return this.makeRequest<void>(`/users/${userId}`, "DELETE")
  }

  /**
   * Enable or disable a user
   */
  async setUserEnabled(userId: string, enabled: boolean): Promise<void> {
    return this.makeRequest<void>(`/users/${userId}`, "PUT", { enabled })
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<any> {
    return this.makeRequest<any>(`/users/${userId}/role-mappings`)
  }

  /**
   * Get available realm roles
   */
  async getRealmRoles(): Promise<any[]> {
    return this.makeRequest<any[]>(`/roles`)
  }

  /**
   * Assign realm role to user
   */
  async assignRealmRoleToUser(userId: string, roleName: string): Promise<void> {
    // First, get the role
    const roles = await this.getRealmRoles()
    const role = roles.find((r) => r.name === roleName)

    if (!role) {
      throw new Error(`Role ${roleName} not found`)
    }

    // Then assign it
    return this.makeRequest<void>(`/users/${userId}/role-mappings/realm`, "POST", [role])
  }

  /**
   * Remove realm role from user
   */
  async removeRealmRoleFromUser(userId: string, roleName: string): Promise<void> {
    // First, get the role
    const roles = await this.getRealmRoles()
    const role = roles.find((r) => r.name === roleName)

    if (!role) {
      throw new Error(`Role ${roleName} not found`)
    }

    // Then remove it
    return this.makeRequest<void>(`/users/${userId}/role-mappings/realm`, "DELETE", [role])
  }
}

// Create a singleton instance
export const keycloakService = new KeycloakService()
