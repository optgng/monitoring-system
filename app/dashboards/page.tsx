"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, Copy, Trash2 } from "lucide-react"
import Link from "next/link"

// Демо данные дашбордов
const mockDashboards = [
  {
    uid: "system-overview",
    title: "Обзор системы",
    description: "Общие метрики производительности системы",
    tags: ["system", "overview"],
    panelCount: 8,
    lastModified: "2024-01-15T10:30:00Z",
  },
  {
    uid: "api-monitoring",
    title: "Мониторинг API",
    description: "Метрики производительности REST API",
    tags: ["api", "performance"],
    panelCount: 6,
    lastModified: "2024-01-14T15:45:00Z",
  },
  {
    uid: "database-metrics",
    title: "Метрики базы данных",
    description: "Производительность и состояние БД",
    tags: ["database", "performance"],
    panelCount: 10,
    lastModified: "2024-01-13T09:20:00Z",
  },
]

export default function DashboardsPage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <Header />
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Дашборды</h2>
                <p className="text-muted-foreground">Управление дашбордами мониторинга</p>
              </div>
              <Link href="/dashboards/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать дашборд
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockDashboards.map((dashboard) => (
                <Card key={dashboard.uid} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Link href={`/dashboards/${dashboard.uid}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboards/${dashboard.uid}/settings`}>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {dashboard.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">{dashboard.panelCount} панелей</div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Изменен: {new Date(dashboard.lastModified).toLocaleDateString("ru-RU")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
