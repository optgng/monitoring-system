"use client"

import { useRouter } from "next/navigation"
import { DashboardEditor } from "@/components/dashboard/dashboard-editor"

interface DashboardSettingsPageProps {
  params: {
    id: string
  }
}

export default function DashboardSettingsPage({ params }: DashboardSettingsPageProps) {
  const router = useRouter()

  // В реальном приложении данные загружались бы из API
  const dashboardData = {
    id: params.id,
    title: "Общий обзор системы",
    description: "Основные метрики всех систем",
    uid: "system-overview",
    tags: ["system", "monitoring"],
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
            expr: "100 - (avg(irate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)",
            refId: "A",
            legendFormat: "CPU Usage",
          },
        ],
      },
    ],
    templating: {
      list: [
        {
          name: "instance",
          type: "query",
          query: "label_values(up, instance)",
          current: { text: "All", value: "$__all" },
        },
      ],
    },
    annotations: {
      list: [
        {
          name: "Alerts",
          datasource: "prometheus",
          query: "ALERTS{alertstate='firing'}",
          enable: true,
        },
      ],
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

  const handleSaveDashboard = (dashboard) => {
    console.log("Updating dashboard:", dashboard)
    // В реальном приложении здесь был бы API-запрос на обновление дашборда
    router.push(`/dashboards/${params.id}`)
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardEditor
        dashboardId={params.id}
        initialData={dashboardData}
        onSave={handleSaveDashboard}
        isCreating={false}
      />
    </div>
  )
}
