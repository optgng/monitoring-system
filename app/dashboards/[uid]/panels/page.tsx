"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PanelManager } from "@/components/dashboard/panel-manager"
import { useDashboard } from "@/hooks/use-dashboard"

export default function DashboardPanelsPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardUid = params.uid as string
  
  const { dashboard, loading, error } = useDashboard(dashboardUid)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Загрузка...</span>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error || "Дашборд не найден"}</p>
        <Button onClick={() => router.push("/dashboards")}>
          Вернуться к списку
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/dashboards/${dashboardUid}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К дашборду
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление панелями</h1>
            <p className="text-muted-foreground">{dashboard.title}</p>
          </div>
        </div>
      </div>

      <PanelManager
        dashboardId={dashboardUid}
        initialPanels={dashboard?.panels?.map(panel => ({
          id: panel.id?.toString() || "",
          title: panel.title || "",
          description: panel.description,
          type: panel.type || "line",
          dataSource: "cpu",
          size: "medium" as const,
          position: { x: 0, y: 0 }
        })) || []}
        readOnly={false}
      />
    </div>
  )
}
