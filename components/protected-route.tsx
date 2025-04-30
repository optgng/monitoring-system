"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredRoles, fallback }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  // Check if user has required roles
  const hasRequiredRoles = () => {
    if (!requiredRoles || requiredRoles.length === 0) return true
    if (!session?.user?.roles) return false

    return requiredRoles.some((role) => session.user.roles.includes(role))
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`)
    } else if (!isLoading && isAuthenticated && requiredRoles && !hasRequiredRoles()) {
      router.push("/unauthorized")
    }
  }, [isAuthenticated, isLoading, pathname, requiredRoles, router])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  if (requiredRoles && !hasRequiredRoles()) {
    return fallback || null
  }

  return <>{children}</>
}
