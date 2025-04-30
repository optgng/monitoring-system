"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/auth/error", "/unauthorized"]
  const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path))

  useEffect(() => {
    // If not authenticated and not on a public path, redirect to login
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`)
    }
  }, [isAuthenticated, isLoading, isPublicPath, pathname, router])

  // If loading, show minimal layout
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authenticated or on a public path, render the appropriate layout
  if (isAuthenticated || isPublicPath) {
    return (
      <div className="flex h-screen overflow-hidden">
        {isAuthenticated && <Sidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          {isAuthenticated && <Header />}
          <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">{children}</main>
        </div>
      </div>
    )
  }

  // Fallback - should not reach here due to the redirect in useEffect
  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">{children}</main>
    </div>
  )
}
