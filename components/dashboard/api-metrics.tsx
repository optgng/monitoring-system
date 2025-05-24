"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Database, Users } from "lucide-react"

interface ApiMetrics {
  totalDashboards: number
  totalPanels: number
  activeUsers: number
  avgResponseTime: number
  uptime: string
  lastUpdate: string
}

export function ApiMetrics() {
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) return

        // Здесь должен быть реальный endpoint для метрик
        // const response = await fetch(`${apiUrl}/metrics`)
        // const data = await response.json()

        // Пока используем моковые данные
        const mockMetrics: ApiMetrics = {
          totalDashboards: Math.floor(Math.random() * 50) + 10,
          totalPanels: Math.floor(Math.random() * 200) + 50,
          activeUsers: Math.floor(Math.random() * 20) + 5,
          avgResponseTime: Math.floor(Math.random() * 100) + 50,
          uptime: "99.9%",
          lastUpdate: new Date().toISOString(),
        }

        setMetrics(mockMetrics)
      } catch (error) {
        console.error("Failed to fetch API metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Обновляем каждую минуту

    return () => clearInterval(interval)
  }, [])

  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Метрики API</CardTitle>
          <CardDescription>Статистика работы микросервиса дашбордов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Загрузка метрик...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Метрики API</CardTitle>
        <CardDescription>Статистика работы микросервиса дашбордов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.totalDashboards}</div>
              <div className="text-xs text-muted-foreground">Дашбордов</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.totalPanels}</div>
              <div className="text-xs text-muted-foreground">Панелей</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <div className="text-xs text-muted-foreground">Активных</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">Отклик</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Время работы:</span>
              <Badge variant="outline">{metrics.uptime}</Badge>
            </div>
            <div className="text-muted-foreground">Обновлено: {new Date(metrics.lastUpdate).toLocaleTimeString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
