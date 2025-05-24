"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          setStatus("disconnected")
          return
        }

        const response = await fetch(`${apiUrl}/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setStatus("connected")
        } else {
          setStatus("disconnected")
        }
      } catch (error) {
        setStatus("disconnected")
      }
    }

    checkApiStatus()

    // Проверяем статус каждые 30 секунд
    const interval = setInterval(checkApiStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case "checking":
        return {
          icon: Loader2,
          text: "Проверка...",
          variant: "secondary" as const,
          className: "animate-spin",
        }
      case "connected":
        return {
          icon: Wifi,
          text: "API подключен",
          variant: "default" as const,
          className: "text-green-600",
        }
      case "disconnected":
        return {
          icon: WifiOff,
          text: "API недоступен",
          variant: "destructive" as const,
          className: "text-red-600",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className={`h-3 w-3 ${config.className}`} />
      {config.text}
    </Badge>
  )
}
