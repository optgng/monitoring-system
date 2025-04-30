import { signIn, signOut } from "next-auth/react"
import { logger } from "./logger"

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  timeoutMs?: number
}

export async function signInWithRetry(
  provider: string,
  options: { callbackUrl?: string; redirect?: boolean } = {},
  retryOptions: RetryOptions = {},
) {
  const { maxRetries = 3, retryDelay = 1000, timeoutMs = 10000 } = retryOptions

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Authentication attempt ${attempt} of ${maxRetries}`)

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Authentication request timed out")), timeoutMs)
      })

      // Create the sign-in promise
      const signInPromise = signIn(provider, options)

      // Race the promises
      return await Promise.race([signInPromise, timeoutPromise])
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      logger.error(`Authentication attempt ${attempt} failed:`, lastError)

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt))
    }
  }

  // This should never be reached due to the throw in the loop,
  // but TypeScript needs a return value
  throw lastError || new Error("Authentication failed after retries")
}

export async function signOutWithErrorHandling(options: { callbackUrl?: string; redirect?: boolean } = {}) {
  try {
    await signOut(options)
  } catch (error) {
    logger.error("Error during sign out", error)

    // If redirect is false, we need to handle the error
    if (options.redirect === false) {
      throw error
    }

    // If redirect is true (default), we'll redirect to the callback URL anyway
    if (options.callbackUrl) {
      window.location.href = options.callbackUrl
    }
  }
}

/**
 * Handles session errors, particularly token refresh errors
 * @param session The session object
 * @returns True if there was an error that was handled, false otherwise
 */
export function handleSessionError(session: any): boolean {
  if (session?.error === "RefreshAccessTokenError") {
    logger.error("Session error: Failed to refresh access token")

    // Sign the user out due to refresh token failure
    signOutWithErrorHandling({ callbackUrl: "/login?error=token_refresh_failed" })
    return true
  }

  return false
}
