"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dashboardApi } from "@/lib/dashboard-api"
import { grafanaApi } from "@/lib/grafana-api"

export function GrafanaConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [checking, setChecking] = useState(false)

  const checkConnection = async () => {
    setChecking(true)
    try {
      // Проверяем подключение к сервису дашбордов
      const dashboardsHealthResponse = await dashboardApi.request<any>('/healthz')
      // Проверяем подключение к Grafana
      const grafanaHealthStatus = await grafanaApi.checkHealth()

      if (dashboardsHealthResponse && dashboardsHealthResponse.status === 'healthy' && grafanaHealthStatus) {
        setStatus('connected')
        setErrorMessage('')
      } else {
        setStatus('error')
        setErrorMessage('Сервис недоступен')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Ошибка подключения')
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="flex items-center gap-2">
      {status === 'checking' || checking ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
          <span className="text-sm">Проверка подключения...</span>
        </>
      ) : status === 'connected' ? (
        <>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Подключено к Grafana
          </Badge>
        </>
      ) : (
        <>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ошибка подключения
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConnection}
            disabled={checking}
            className="h-7 px-2 text-xs"
          >
            {checking ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Повторить
          </Button>
        </>
      )}
    </div>
  )
}
