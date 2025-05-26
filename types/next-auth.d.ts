import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles: string[]
      username?: string
    }
    accessToken?: string
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    roles?: string[]
    username?: string
    lastTokenRefresh?: number
    error?: string
  }
}
