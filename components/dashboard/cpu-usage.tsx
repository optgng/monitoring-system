"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Cpu, TrendingUp, TrendingDown, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://monitoring-service.localhost:8000"

interface CpuData {
  average: number
  trend: "up" | "down" | "stable"
  devices: Array<{ name: string; usage: number }>
}

export function CpuUsage() {
  const [cpu, setCpu] = useState<CpuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previousValue, setPreviousValue] = useState<number | null>(null)

  useEffect(() => {
    const fetchCpuUsage = async () => {
      setLoading(true)
      try {
        setError(null)

        // Получаем метрики напрямую от API
        const metricsRes = await fetch(`${API_URL}/api/v1/metrics/metrics`)
        if (!metricsRes.ok) {
          throw new Error(`Failed to fetch metrics: ${metricsRes.statusText}`)
        }
        const metricsText = await metricsRes.text()

        // Парсим CPU метрики
        const cpuMetrics: Array<{ name: string; usage: number }> = []
        metricsText.split("\n").forEach((line) => {
          const match = line.match(/cpu_usage_percent\{host_name="([^"]+)"\}\s+([0-9.]+)/)
          if (match) {
            cpuMetrics.push({
              name: match[1],
              usage: parseFloat(match[2])
            })
          }
        })

        if (cpuMetrics.length === 0) {
          throw new Error("No CPU metrics found")
        }

        // Вычисляем среднее
        const averageUsage = cpuMetrics.reduce((sum, m) => sum + m.usage, 0) / cpuMetrics.length

        // Определяем тренд
        let trend: "up" | "down" | "stable" = "stable"
        if (previousValue !== null) {
          const diff = averageUsage - previousValue
          if (Math.abs(diff) > 2) {
            trend = diff > 0 ? "up" : "down"
          }
        }

        setCpu({
          average: Math.round(averageUsage),
          trend,
          devices: cpuMetrics
        })

        setPreviousValue(averageUsage)
      } catch (error) {
        console.error("Failed to fetch CPU usage:", error)
        setError(error instanceof Error ? error.message : "Ошибка подключения к API")
        setCpu(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCpuUsage()
    const interval = setInterval(fetchCpuUsage, 5000)

    return () => clearInterval(interval)
  }, [previousValue])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Загрузка CPU</CardTitle>
          <CardDescription>Средняя нагрузка на процессор</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !cpu) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Загрузка CPU
            <Badge variant="destructive" className="text-xs">Ошибка</Badge>
          </CardTitle>
          <CardDescription>Средняя нагрузка на процессор</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">{error || "Нет данных"}</div>
        </CardContent>
      </Card>
    )
  }

  const getCpuColor = () => {
    if (cpu.average < 50) return "text-green-600"
    if (cpu.average < 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = () => {
    if (cpu.average < 50) return ""
    if (cpu.average < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getTrendIcon = () => {
    switch (cpu.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Загрузка CPU
        </CardTitle>
        <CardDescription>Средняя нагрузка на процессор</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${getCpuColor()}`}>
                {cpu.average}%
              </span>
              {getTrendIcon()}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Устройств</div>
              <div className="text-lg font-semibold">{cpu.devices.length}</div>
            </div>
          </div>

          <Progress
            value={cpu.average}
            className={`h-3 ${getProgressColor()}`}
          />

          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Топ-3 по загрузке CPU:</div>
            {cpu.devices
              .sort((a, b) => b.usage - a.usage)
              .slice(0, 3)
              .map((device, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3" />
                    <span>{device.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={Math.round(device.usage) > 80 ? "text-red-600" : Math.round(device.usage) > 50 ? "text-yellow-600" : "text-green-600"}>
                      {Math.round(device.usage)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
