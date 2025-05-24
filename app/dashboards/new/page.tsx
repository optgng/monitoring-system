"use client"
import { useRouter } from "next/navigation"
import { DashboardEditor } from "@/components/dashboard/dashboard-editor"
import { toast } from "@/components/ui/use-toast"

export default function NewDashboardPage() {
  const router = useRouter()

  // Initial empty dashboard data
  const emptyDashboard = {
    id: "new",
    title: "",
    description: "",
    uid: "",
    tags: [],
    timezone: "browser",
    refresh: "5s",
    time: {
      from: "now-6h",
      to: "now",
    },
    panels: [],
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
    panels: [],
    schemaVersion: 30,
    style: "dark",
    version: 0,
  }

  // Handle saving the new dashboard
  const handleSaveDashboard = (dashboard) => {
    console.log("Creating new dashboard:", dashboard)
    // В реальном приложении здесь был бы API-запрос на создание дашборда в Grafana
    const newId = Date.now()
    toast({
      title: "Дашборд создан",
      description: "Новый дашборд успешно создан и сохранен в Grafana",
    })
    router.push(`/dashboards/${newId}`)
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardEditor dashboardId="new" initialData={emptyDashboard} onSave={handleSaveDashboard} isCreating={true} />
    </div>
  )
}
