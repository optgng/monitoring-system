"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Power, PowerOff, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://monitoring-service.localhost:8000"

type Device = {
  id: string
  name: string
  system_name: string
  ip_address: string
  description: string
  status?: "online" | "offline"
}

interface ServersOverview {
  online: number
  offline: number
  total: number
  devices: Device[]
}

export function ServersOverview() {
  const [servers, setServers] = useState<ServersOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true)
      try {
        setError(null)

        // Получаем список устройств напрямую от API
        const devicesRes = await fetch(`${API_URL}/api/v1/devices/`)
        if (!devicesRes.ok) {
          throw new Error(`Failed to fetch devices: ${devicesRes.statusText}`)
        }
        const devices: Device[] = await devicesRes.json()

        // Получаем метрики статуса напрямую от API
        const metricsRes = await fetch(`${API_URL}/api/v1/metrics/metrics`)
        if (!metricsRes.ok) {
          throw new Error(`Failed to fetch metrics: ${metricsRes.statusText}`)
        }
        const metricsText = await metricsRes.text()

        // Парсим статусы устройств из метрик
        const statusMap: Record<string, "online" | "offline"> = {}
        metricsText.split("\n").forEach((line) => {
          const match = line.match(/device_up\{host_name="([^"]+)"\}\s+([01])/)
          if (match) {
            statusMap[match[1]] = match[2] === "1" ? "online" : "offline"
          }
        })

        // Проставляем статус каждому устройству
        const devicesWithStatus = devices.map((d) => ({
          ...d,
          status: statusMap[d.name] || "offline",
        }))

        // Подсчитываем статистику
        const online = devicesWithStatus.filter(d => d.status === "online").length
        const offline = devicesWithStatus.filter(d => d.status === "offline").length

        setServers({
          online,
          offline,
          total: devicesWithStatus.length,
          devices: devicesWithStatus
        })
      } catch (error) {
        console.error("Failed to fetch servers overview:", error)
        setError(error instanceof Error ? error.message : "Ошибка подключения к API")
        setServers(null)
      } finally {
        setLoading(false)
      }
    }

    fetchServers()
    const interval = setInterval(fetchServers, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Устройства</CardTitle>
          <CardDescription>Статус подключенных устройств</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !servers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Устройства
            <Badge variant="destructive" className="text-xs">Ошибка</Badge>
          </CardTitle>
          <CardDescription>Статус подключенных устройств</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">{error || "Нет данных"}</div>
        </CardContent>
      </Card>
    )
  }

  const uptime = servers.total > 0 ? ((servers.online / servers.total) * 100).toFixed(1) : "0.0"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Устройства
        </CardTitle>
        <CardDescription>Статус подключенных устройств</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Power className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-3xl font-bold text-green-600">{servers.online}</div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PowerOff className="h-6 w-6 text-red-600" />
              <div>
                <div className="text-3xl font-bold text-red-600">{servers.offline}</div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Доступность</span>
              <Badge variant={parseFloat(uptime) > 95 ? "default" : "destructive"}>
                {uptime}%
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Всего устройств: {servers.total}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
