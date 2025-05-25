"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Bell, Shield, TrendingUp } from "lucide-react"

interface AlertsSummary {
  critical: number
  warning: number
  info: number
  resolved: number
  totalActive: number
}

export function AlertsSummary() {
  const [alerts, setAlerts] = useState<AlertsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_MONITORING_API_URL
        if (!apiUrl) return

        const response = await fetch(`${apiUrl}/alerts/summary`)
        const data = await response.json()
        setAlerts(data)
      } catch (error) {
        console.error("Failed to fetch alerts summary:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading || !alerts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Сводка по алертам</CardTitle>
          <CardDescription>Текущие уведомления и предупреждения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Сводка по алертам
        </CardTitle>
        <CardDescription>Текущие уведомления и предупреждения</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{alerts.critical}</div>
                <div className="text-xs text-muted-foreground">Критические</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{alerts.warning}</div>
                <div className="text-xs text-muted-foreground">Предупреждения</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-blue-600">{alerts.info}</div>
              <div className="text-xs text-muted-foreground">Информационные</div>
            </div>

            <div>
              <div className="text-lg font-bold text-green-600">{alerts.resolved}</div>
              <div className="text-xs text-muted-foreground">Решенные</div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Всего активных</span>
              <Badge variant={alerts.totalActive > 0 ? "destructive" : "default"}>
                {alerts.totalActive}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
