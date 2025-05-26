"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Eye, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { dashboardApi } from "@/lib/dashboard-api"
import type { Dashboard } from "@/lib/dashboard-api"
import { getTagStyle } from "@/lib/tag-colors"

interface DashboardViewerProps {
  uid: string
}

export function DashboardViewer({ uid }: DashboardViewerProps) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadDashboard()
  }, [uid])

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.getDashboard(uid)
      if (response.status === "success") {
        setDashboard(response.data as Dashboard)
      } else {
        setError(response.message || "Failed to load dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Дашборд не найден"}</p>
          <Button onClick={() => router.push("/dashboards")}>
            Вернуться к списку
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К дашбордам
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dashboard.title}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboard}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button onClick={() => router.push(`/dashboards/${uid}/panels`)}>
            <Edit className="mr-2 h-4 w-4" />
            Управление панелями
          </Button>
        </div>
      </div>
      {dashboard.tags && dashboard.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dashboard.tags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              style={getTagStyle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Убираем табы и показываем панели напрямую */}
      <div className="space-y-6">
        {dashboard.panels && dashboard.panels.length > 0 ? (
          dashboard.panels.map(panel => (
            <Card key={panel.id}>
              <CardHeader>
                <CardTitle>{panel.title}</CardTitle>
                {panel.description && (
                  <CardDescription>{panel.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Панель: {panel.type}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Визуализация данных будет здесь
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                В этом дашборде пока нет панелей
              </p>
              <Button onClick={() => router.push(`/dashboards/${uid}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Добавить панели
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
