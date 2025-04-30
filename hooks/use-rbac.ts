"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { handleSessionError } from "@/lib/auth-utils"

export function useRBAC(requiredRoles?: string[]) {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Handle session errors
    if (session?.error) {
      handleSessionError(session)
      setIsLoading(false)
      return
    }

    // If no roles are required, grant access
    if (!requiredRoles || requiredRoles.length === 0) {
      setHasAccess(status === "authenticated")
      setIsLoading(status === "loading")
      return
    }

    // Check if the user has the required roles
    if (status === "authenticated" && session?.user?.roles) {
      const userRoles = session.user.roles as string[]
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))
      setHasAccess(hasRequiredRole)
    } else {
      setHasAccess(false)
    }

    setIsLoading(status === "loading")
  }, [session, status, requiredRoles])

  return {
    hasAccess,
    isLoading,
    isAuthenticated: status === "authenticated",
    userRoles: (session?.user?.roles as string[]) || [],
  }
}
