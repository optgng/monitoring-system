"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { logger } from "@/lib/logger"
import { handleSessionError } from "@/lib/auth-utils"

/**
 * Component that handles automatic session refresh
 * This should be placed high in the component tree
 */
export function SessionRefresh() {
  const { data: session, status, update } = useSession()
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const lastRefreshAttempt = useRef<number>(0)
  const isRefreshing = useRef<boolean>(false)

  // Получаем текущий путь для проверки, находимся ли мы на странице профиля
  const pathname = usePathname()
  const isProfilePage = pathname === "/profile"

  useEffect(() => {
    // Clear any existing interval when component unmounts or session changes
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  useEffect(() => {
    // Handle session errors
    if (session?.error) {
      handleSessionError(session)
      return
    }

    // Отключаем автоматическое обновление на странице профиля
    if (isProfilePage) {
      logger.debug("Session refresh disabled on profile page")
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
      return
    }

    // Only set up refresh for authenticated sessions
    if (status === "authenticated" && session) {
      // Calculate when to refresh (75% of the way through the session)
      const sessionMaxAge = 30 * 24 * 60 * 60 // 30 days in seconds
      const refreshTime = sessionMaxAge * 0.75 * 1000 // 75% of session time in milliseconds

      // Set up interval to refresh the session
      const interval = setInterval(() => {
        const now = Date.now()

        // Предотвращаем слишком частые обновления (не чаще чем раз в 30 минут)
        if (now - lastRefreshAttempt.current < 30 * 60 * 1000) {
          logger.debug("Skipping session refresh - too soon since last attempt")
          return
        }

        // Предотвращаем параллельные обновления
        if (isRefreshing.current) {
          logger.debug("Skipping session refresh - already in progress")
          return
        }

        logger.debug("Refreshing session")
        isRefreshing.current = true
        lastRefreshAttempt.current = now

        update()
          .then(() => {
            logger.debug("Session refreshed successfully")
          })
          .catch((error) => {
            logger.error("Failed to refresh session", error)
          })
          .finally(() => {
            isRefreshing.current = false
          })
      }, refreshTime)

      setRefreshInterval(interval)

      logger.debug("Session refresh interval set", { refreshTime })
    }
  }, [session, status, update, isProfilePage])

  // This component doesn't render anything
  return null
}
