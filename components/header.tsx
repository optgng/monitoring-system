"use client"

import { useState, useEffect } from "react"
import { Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { signOutWithErrorHandling } from "@/lib/auth-utils"
import { logger } from "@/lib/logger"

// Удаление cookie по имени (универсально для всех путей и доменов)
function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; Max-Age=0; path=/;`
  document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname};`
}

// Очистка всех next-auth cookies и кэша
const clearLocalAuthData = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()
      // Удаляем все основные next-auth cookies
      deleteCookie("next-auth.csrf-token")
      deleteCookie("next-auth.session-token")
      deleteCookie("next-auth.callback-url")
      deleteCookie("next-auth.state")
      deleteCookie("next-auth.pkce.code_verifier")
      deleteCookie("next-auth.pkce.state")
    }
    if (window && (window as any).profileCache) {
      ;(window as any).profileCache.clear()
    }
  } catch (e) {
    // ignore
  }
}

export default function Header() {
  const [notifications, setNotifications] = useState(3)
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Check for session errors
  useEffect(() => {
    if (session?.error) {
      logger.error("Session error detected in header", { error: session.error })
    }
  }, [session])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      // Сначала signOutWithErrorHandling для сброса next-auth сессии на сервере
      await signOutWithErrorHandling({ redirect: false })
      clearLocalAuthData()

      // Get the logout URL from the server-side API
      const postLogoutRedirectUri = `${window.location.origin}/login`
      const response = await fetch(`/api/auth/logout-url?redirectUri=${encodeURIComponent(postLogoutRedirectUri)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.logoutUrl) {
          window.location.href = data.logoutUrl
          return
        }
      }

      // Simple fallback - no environment variables used
      window.location.href = "/login"
    } catch (error) {
      logger.error("Error during sign out", error)
      clearLocalAuthData()
      window.location.href = "/login"
    } finally {
      setIsSigningOut(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!session?.user?.name) return "U"
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4 md:gap-6">
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="font-medium">Критическая нагрузка</span>
                <span className="ml-2 text-xs text-muted-foreground">Сервер DB-01</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="font-medium">Недоступен сервис</span>
                <span className="ml-2 text-xs text-muted-foreground">API Gateway</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="font-medium">Высокая нагрузка CPU</span>
                <span className="ml-2 text-xs text-muted-foreground">Web-01</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {session?.user?.name || "Пользователь"}
                {session?.user?.email && <p className="text-xs text-muted-foreground">{session.user.email}</p>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500" disabled={isSigningOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isSigningOut ? "Выход..." : "Выйти"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
