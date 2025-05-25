"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Database, Users, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "http://dashboards-service.localhost:8050"

interface ApiMetrics {
  total_dashboards: number
  total_panels: number
  api_response_time_ms: number
  grafana_health_status: boolean
  lastUpdate: string
}

export function ApiMetrics() {
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        setError(null)

        if (!API_URL) {
          throw new Error("Dashboard API URL not configured")
        }

        // Получаем JSON метрики от API дашбордов
        const response = await fetch(`${API_URL}/api/metrics/json`)
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }

        const metricsData = await response.json()

        setMetrics({
          total_dashboards: metricsData.total_dashboards || 0,
          total_panels: metricsData.total_panels || 0,
          api_response_time_ms: metricsData.api_response_time_ms || 0,
          grafana_health_status: metricsData.grafana_health_status || false,
          lastUpdate: new Date().toISOString()
        })
      } catch (error) {
        console.error("Failed to fetch API metrics:", error)
        setError(error instanceof Error ? error.message : "Ошибка подключения к API дашбордов")
        setMetrics(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статистика дашбордов</CardTitle>
          <CardDescription>Метрики Grafana и системы дашбордов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Статистика дашбордов
            <Badge variant="destructive" className="text-xs">Недоступно</Badge>
          </CardTitle>
          <CardDescription>Метрики Grafana и системы дашбордов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">{error || "Нет данных"}</div>
        </CardContent>
      </Card>
    )
  }

  const getHealthBadge = () => {
    return metrics.grafana_health_status ? (
      <Badge variant="default" className="text-xs bg-green-500">Здоровая</Badge>
    ) : (
      <Badge variant="destructive" className="text-xs">Проблемы</Badge>
    )
  }

  const getResponseTimeColor = () => {
    if (metrics.api_response_time_ms < 500) return "text-green-600"
    if (metrics.api_response_time_ms < 1000) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Статистика дашбордов
          {getHealthBadge()}
        </CardTitle>
        <CardDescription>Метрики Grafana и системы дашбордов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.total_dashboards}</div>
              <div className="text-xs text-muted-foreground">Дашбордов</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{metrics.total_panels}</div>
              <div className="text-xs text-muted-foreground">Панелей</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <div className={`text-2xl font-bold ${getResponseTimeColor()}`}>
                {Math.round(metrics.api_response_time_ms)}ms
              </div>
              <div className="text-xs text-muted-foreground">Отклик API</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Статус системы:</span>
              {metrics.grafana_health_status ? (
                <Badge variant="outline" className="text-green-600 border-green-600">Работает</Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">Ошибки</Badge>
              )}
            </div>
            <div className="text-muted-foreground">
              Обновлено: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
