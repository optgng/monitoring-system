"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardSettings } from "@/components/dashboard/dashboard-settings"
import { toast } from "@/components/ui/use-toast"

export default function DashboardSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardId = params.id

  // Имитация данных дашборда
  const dashboardData = {
    title: "Общий обзор системы",
    description: "Основные метрики всех систем",
    type: "system",
    isPublic: false,
    refreshInterval: "300",
    permissions: ["admin", "manager", "user"],
  }

  const handleSave = (data) => {
    // В реальном приложении здесь был бы API-запрос на сохранение
    toast({
      title: "Настройки сохранены",
      description: "Настройки дашборда успешно обновлены",
      variant: "default",
    })
    router.push(`/dashboards/${dashboardId}`)
  }

  const handleDelete = () => {
    // В реальном приложении здесь был бы API-запрос на удаление
    toast({
      title: "Дашборд удален",
      description: "Дашборд был успешно удален",
      variant: "default",
    })
    router.push("/dashboards")
  }

  return (
    <DashboardSettings
      dashboardId={dashboardId}
      initialData={dashboardData}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  )
}
