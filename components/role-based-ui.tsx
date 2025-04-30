"use client"

import type React from "react"

import { useRBAC } from "@/hooks/use-rbac"
import { Skeleton } from "@/components/ui/skeleton"

interface RoleBasedUIProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
}

export function RoleBasedUI({
  children,
  requiredRoles,
  fallback = null,
  loadingComponent = <Skeleton className="h-10 w-full" />,
}: RoleBasedUIProps) {
  const { hasAccess, isLoading } = useRBAC(requiredRoles)

  if (isLoading) {
    return <>{loadingComponent}</>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
