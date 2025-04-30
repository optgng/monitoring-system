"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bell, Home, LayoutDashboard, Shield, Users, Cpu, AlertTriangle, FileText, FileSearch } from "lucide-react"
import { useSession } from "next-auth/react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Get user roles from session
  const userRoles = session?.user?.roles || []

  // Check if user has a specific role
  const hasRole = (role: string) => userRoles.includes(role)

  // Check if user is admin
  const isAdmin = hasRole("admin")

  // Check if user is manager
  const isManager = hasRole("manager")

  // Check if user is support
  const isSupport = hasRole("support")

  return (
    <div className={cn("pb-12 w-64 border-r bg-gray-100/40 dark:bg-gray-800/40", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Мониторинг</span>
          </h2>
          <div className="space-y-1">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Главная
              </Link>
            </Button>
            <Button
              variant={pathname === "/dashboards" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboards">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Дашборды
              </Link>
            </Button>

            {/* Отчеты - только для руководителей и администраторов */}
            {(isManager || isAdmin) && (
              <Button
                variant={pathname === "/reports" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  Отчеты
                </Link>
              </Button>
            )}

            {/* Разделы, доступные только администраторам */}
            {isAdmin && (
              <>
                <Button
                  variant={pathname === "/devices" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/devices">
                    <Cpu className="mr-2 h-4 w-4" />
                    Устройства
                  </Link>
                </Button>
                <Button
                  variant={pathname === "/alerts" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/alerts">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Оповещения
                  </Link>
                </Button>
              </>
            )}

            {/* Логи - доступны для специалистов технической поддержки и администраторов */}
            {(isSupport || isAdmin) && (
              <Button
                variant={pathname === "/logs" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/logs">
                  <FileSearch className="mr-2 h-4 w-4" />
                  Логи
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Раздел администрирования - только для администраторов */}
        {isAdmin && (
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Администрирование</h2>
            <div className="space-y-1">
              <Button
                variant={pathname === "/users" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/users">
                  <Users className="mr-2 h-4 w-4" />
                  Пользователи
                </Link>
              </Button>
              <Button
                variant={pathname === "/notifications" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Уведомления
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
