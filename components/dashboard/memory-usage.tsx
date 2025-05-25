"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MemoryStick, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://monitoring-service.localhost:8000"

interface MemoryData {
  usedPercent: number
  totalGB: number
  usedGB: number
  freeGB: number
  cachedGB: number
  buffersGB: number
}

export function MemoryUsage() {
  const [memory, setMemory] = useState<MemoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemoryUsage = async () => {
      setLoading(true)
      try {
        setError(null)

        // Получаем метрики напрямую от API
        const metricsRes = await fetch(`${API_URL}/api/v1/metrics/metrics`)
        if (!metricsRes.ok) {
          throw new Error(`Failed to fetch metrics: ${metricsRes.statusText}`)
        }
        const metricsText = await metricsRes.text()

        // Парсим метрики памяти с поддержкой экспоненциальной записи
        let totalMemory = 0, usedMemory = 0, freeMemory = 0, cachedMemory = 0, buffersMemory = 0
        let memoryUsagePercent = 0
        let deviceCount = 0

        metricsText.split("\n").forEach((line) => {
          const memoryUsageMatch = line.match(/memory_usage_percent\{host_name="([^"]+)"\}\s+([0-9.eE+-]+)/)
          if (memoryUsageMatch) {
            memoryUsagePercent += parseFloat(memoryUsageMatch[2])
            deviceCount++
          }

          const totalMatch = line.match(/memory_total\{host_name="([^"]+)"\}\s+([0-9.eE+-]+)/)
          if (totalMatch) {
            totalMemory += parseFloat(totalMatch[2])
          }

          const usedMatch = line.match(/memory_used\{host_name="([^"]+)"\}\s+([0-9.eE+-]+)/)
          if (usedMatch) {
            usedMemory += parseFloat(usedMatch[2])
          }

          const freeMatch = line.match(/memory_free\{host_name="([^"]+)"\}\s+([0-9.eE+-]+)/)
          if (freeMatch) {
            freeMemory += parseFloat(freeMatch[2])
          }

          const cachedMatch = line.match(/memory_Cached_bytes\{host_name="([^"]+)"\}\s+([0-9.eE+-]+)/)
          if (cachedMatch) {
            cachedMemory += parseFloat(cachedMatch[2])
          }

          const buffersMatch = line.match(/memory_Buffers_bytes\{host_name="([^"]+)"\}\s+([0-9.eE+-]+)/)
          if (buffersMatch) {
            buffersMemory += parseFloat(buffersMatch[2])
          }
        })

        if (deviceCount === 0) {
          throw new Error("No memory metrics found")
        }

        setMemory({
          usedPercent: Math.round(memoryUsagePercent / deviceCount),
          totalGB: totalMemory / (1024 ** 3),
          usedGB: usedMemory / (1024 ** 3),
          freeGB: freeMemory / (1024 ** 3),
          cachedGB: cachedMemory / (1024 ** 3),
          buffersGB: buffersMemory / (1024 ** 3)
        })
      } catch (error) {
        console.error("Failed to fetch memory usage:", error)
        setError(error instanceof Error ? error.message : "Ошибка подключения к API")
        setMemory(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMemoryUsage()
    const interval = setInterval(fetchMemoryUsage, 10000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Использование памяти</CardTitle>
          <CardDescription>Состояние оперативной памяти</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !memory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Использование памяти
            <Badge variant="destructive" className="text-xs">Ошибка</Badge>
          </CardTitle>
          <CardDescription>Состояние оперативной памяти</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">{error || "Нет данных"}</div>
        </CardContent>
      </Card>
    )
  }

  const getMemoryColor = () => {
    if (memory.usedPercent < 60) return "text-green-600"
    if (memory.usedPercent < 85) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = () => {
    if (memory.usedPercent < 60) return ""
    if (memory.usedPercent < 85) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MemoryStick className="h-5 w-5" />
          Использование памяти
        </CardTitle>
        <CardDescription>Состояние оперативной памяти</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getMemoryColor()}`}>
              {memory.usedPercent}%
            </span>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {memory.usedGB.toFixed(2)} GB
              </div>
              <div className="text-sm text-muted-foreground">
                из {memory.totalGB.toFixed(2)} GB
              </div>
            </div>
          </div>

          <Progress
            value={memory.usedPercent}
            className={`h-3 ${getProgressColor()}`}
          />

          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <div className="text-muted-foreground">Свободно</div>
              <div className="font-semibold text-green-600">
                {memory.freeGB.toFixed(2)} GB
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Кэш</div>
              <div className="font-semibold">
                {memory.cachedGB.toFixed(2)} GB
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Буферы: {memory.buffersGB.toFixed(2)} GB
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
