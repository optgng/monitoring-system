"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardEditor } from "@/components/dashboard/dashboard-editor"
import { toast } from "@/components/ui/use-toast"

export default function DashboardSettingsPage() {
  const params = useParams()
  const dashboardId = params.id
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    // В реальном приложении здесь был бы API-запрос для получения данных дашборда
    const mockDashboard = {
      id: dashboardId,
      title: "Общий обзор системы",
      description: "Основные метрики всех систем",
      uid: "system-overview",
      tags: ["system", "overview"],
      timezone: "browser",
      refresh: "5s",
      time: {
        from: "now-6h",
        to: "now",
      },
      panels: [
        {
          id: 1,
          title: "CPU Usage",
          type: "timeseries",
          targets: [
            {
              expr: "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)",
              refId: "A",
              legendFormat: "{{instance}}",
            },
          ],
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
        },
        {
          id: 2,
          title: "Memory Usage",
          type: "stat",
          targets: [
            {
              expr: "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
              refId: "A",
              legendFormat: "Memory Usage %",
            },
          ],
          gridPos: { h: 8, w: 12, x: 12, y: 0 },
        },
      ],
      templating: {
        list: [],
      },
      annotations: {
        list: [],
      },
      editable: true,
      fiscalYearStartMonth: 0,
      graphTooltip: 0,
      links: [],
      liveNow: false,
      schemaVersion: 30,
      style: "dark",
      version: 1,
    }

    setDashboardData(mockDashboard)
  }, [dashboardId])

  const handleSaveDashboard = (dashboard) => {
    console.log("Updating dashboard:", dashboard)
    // В реальном приложении здесь был бы API-запрос на обновление дашборда в Grafana
    toast({
      title: "Дашборд обновлен",
      description: "Изменения дашборда успешно сохранены в Grafana",
    })
  }

  if (!dashboardData) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardEditor
        dashboardId={dashboardId}
        initialData={dashboardData}
        onSave={handleSaveDashboard}
        isCreating={false}
      />
    </div>
  )
}
