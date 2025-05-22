"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://monitoring-service.localhost:8000"

type Device = {
  id: string
  name: string
  system_name: string
  ip_address: string
  description: string
  status?: "online" | "offline"
}

type SystemGroup = {
  system_name: string
  devices: Device[]
  status: "operational" | "degraded" | "outage"
}

function getDeviceStatusIcon(status: string) {
  if (status === "online") {
    return <CheckCircle2 className="text-green-500 h-5 w-5" title="В сети" />
  }
  return <XCircle className="text-red-500 h-5 w-5" title="Не в сети" />
}

export function SystemStatus() {
  const [systems, setSystems] = useState<SystemGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/v1/devices/`)
        const devices: Device[] = await res.json()
        const metricsRes = await fetch(`${API_URL}/api/v1/metrics/metrics`)
        const metricsText = await metricsRes.text()
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
        // Группируем по system_name
        const grouped: Record<string, Device[]> = {}
        devicesWithStatus.forEach((d) => {
          if (!grouped[d.system_name]) grouped[d.system_name] = []
          grouped[d.system_name].push(d)
        })
        // Формируем массив систем с общим статусом
        const systemGroups: SystemGroup[] = Object.entries(grouped).map(
          ([system_name, devices]) => {
            // Если хотя бы одно offline — outage, если все online — operational, иначе degraded
            const onlineCount = devices.filter((d) => d.status === "online").length
            let status: SystemGroup["status"] = "operational"
            if (onlineCount === 0) status = "outage"
            else if (onlineCount < devices.length) status = "degraded"
            return { system_name, devices, status }
          }
        )
        setSystems(systemGroups)
      } catch {
        setSystems([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Работает</Badge>
      case "degraded":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            Частично
          </Badge>
        )
      case "outage":
        return <Badge variant="destructive">Проблемы</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        systems.map((system) => (
          <Card key={system.system_name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{system.system_name}</CardTitle>
                {getStatusBadge(system.status)}
              </div>
              {/* Количество устройств убрано */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {system.devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between rounded-lg border p-2">
                    <span className="font-medium">{device.name}</span>
                    <div className="flex items-center gap-2">
                      {getDeviceStatusIcon(device.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
