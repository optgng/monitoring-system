"use client"

import type React from "react"

import { useAuth } from "@/components/providers/simple-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function AuthGuard({ children, requiredRoles = [] }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Проверяем роли если они указаны
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role))
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h1>
            <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
