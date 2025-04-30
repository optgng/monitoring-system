import "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id */
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      /** The user's roles */
      roles: string[]
    }
    /** The access token */
    accessToken?: string
    /** Any error that occurred during the session */
    error?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's roles */
    roles?: string[]
    /** The access token */
    accessToken?: string
    /** The refresh token */
    refreshToken?: string
    /** When the access token expires */
    accessTokenExpires?: number
    /** The token type */
    tokenType?: string
    /** Any error that occurred during token refresh */
    error?: string
  }
}
