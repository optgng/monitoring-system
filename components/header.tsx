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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOutWithErrorHandling } from "@/lib/auth-utils"
import { logger } from "@/lib/logger"

export default function Header() {
  const [notifications, setNotifications] = useState(3)
  const { data: session, status } = useSession()
  const router = useRouter()
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
      await signOutWithErrorHandling({ redirect: false })
      router.push("/login")
    } catch (error) {
      logger.error("Error during sign out", error)
      // Fallback redirect
      router.push("/login")
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
                  <AvatarImage src={session?.user?.image || ""} alt="Аватар" />
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
