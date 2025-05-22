"use client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, LineChart, Settings, Plus, LayoutDashboard, Layers, ChevronDown } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const userRole = getCurrentUser().role
  const isAdmin = userRole === "admin"

  // Mock dashboard categories
  const categories = [
    { id: "system", name: "Системные", count: 3 },
    { id: "network", name: "Сетевые", count: 2 },
    { id: "custom", name: "Пользовательские", count: 5 },
  ]

  // Mock recent dashboards
  const recentDashboards = [
    { id: 1, name: "Общий обзор системы", icon: BarChart3 },
    { id: 2, name: "Производительность серверов", icon: LineChart },
    { id: 3, name: "Сетевая активность", icon: LineChart },
  ]

  return (
    <Sidebar variant="floating" className="border-r">
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Дашборды</h2>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => router.push("/dashboards/new")}>
              <Plus className="h-5 w-5" />
              <span className="sr-only">Создать дашборд</span>
            </Button>
          )}
        </div>
        <div className="px-2 pb-2">
          <SidebarInput placeholder="Поиск дашбордов..." />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Категории</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboards"}>
                  <Link href="/dashboards">
                    <Layers className="h-4 w-4" />
                    <span>Все дашборды</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/dashboards/category/${category.id}`}>
                    <Link href={`/dashboards/category/${category.id}`}>
                      <span>{category.name}</span>
                      <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                        {category.count}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span>Недавние</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentDashboards.map((dashboard) => (
                    <SidebarMenuItem key={dashboard.id}>
                      <SidebarMenuButton asChild isActive={pathname === `/dashboards/${dashboard.id}`}>
                        <Link href={`/dashboards/${dashboard.id}`}>
                          <dashboard.icon className="h-4 w-4" />
                          <span>{dashboard.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {isAdmin && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboards/settings">
                  <Settings className="h-4 w-4" />
                  <span>Настройки дашбордов</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
