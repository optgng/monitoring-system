"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardEditor } from "@/components/dashboard/dashboard-editor"
import { dashboardApi, type Dashboard } from "@/lib/dashboard-api"
import { Loader2 } from "lucide-react"

export default function DashboardSettingsPage() {
  const params = useParams()
  const dashboardUid = params.uid as string
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [dashboardUid])

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.getDashboard(dashboardUid)
      if (response.status === "success") {
        // Убеждаемся что dashboard имеет правильную структуру
        const dashboardData = response.data as Dashboard
        setDashboard({
          ...dashboardData,
          panels: dashboardData.panels || [] // Обеспечиваем наличие массива панелей
        })
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка настроек дашборда...</span>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Дашборд не найден</p>
      </div>
    )
  }

  return <DashboardEditor uid={dashboardUid} isCreating={false} />
}
