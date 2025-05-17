"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bell, Home, LayoutDashboard, Shield, Users, Cpu, AlertTriangle, FileText, FileSearch } from "lucide-react"
import { useSession } from "next-auth/react"
import { RoleBasedUI } from "@/components/role-based-ui"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

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
            <RoleBasedUI
              requiredRoles={["manager", "admin"]}
              loadingComponent={<Skeleton className="h-9 w-full rounded-md" />}
            >
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
            </RoleBasedUI>

            {/* Разделы, доступные только администраторам */}
            <RoleBasedUI
              requiredRoles={["admin"]}
              loadingComponent={
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              }
            >
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
            </RoleBasedUI>

            {/* Логи - доступны для специалистов технической поддержки и администраторов */}
            <RoleBasedUI
              requiredRoles={["support", "admin"]}
              loadingComponent={<Skeleton className="h-9 w-full rounded-md" />}
            >
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
            </RoleBasedUI>
          </div>
        </div>

        {/* Раздел администрирования - только для администраторов */}
        <RoleBasedUI
          requiredRoles={["admin"]}
          loadingComponent={
            <div className="px-4 py-2">
              <Skeleton className="h-6 w-40 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          }
        >
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Администрирование</h2>
            <div className="space-y-1">
              <Button
                variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/admin/users">
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
        </RoleBasedUI>
      </div>
    </div>
  )
}
