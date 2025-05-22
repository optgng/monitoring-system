"use client"
import { useParams, useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardId = params.id
  const userRole = getCurrentUser().role

  // Mock dashboard data
  const dashboardData = {
    id: dashboardId,
    title: "Общий обзор системы",
    description: "Основные метрики всех систем",
    lastUpdated: "2 часа назад",
    panels: [
      {
        id: "panel-1",
        title: "Нагрузка на системы",
        description: "Использование ресурсов за последние 24 часа",
        type: "line",
        dataSource: "cpu",
        size: "medium",
        position: { x: 0, y: 0 },
      },
      {
        id: "panel-2",
        title: "Статистика",
        description: "Общая информация о системе",
        type: "stat",
        dataSource: "servers",
        size: "small",
        position: { x: 0, y: 1 },
      },
      {
        id: "panel-3",
        title: "Распределение ресурсов",
        description: "По типам сервисов",
        type: "pie",
        dataSource: "resources",
        size: "small",
        position: { x: 0, y: 2 },
      },
      {
        id: "panel-4",
        title: "Активность системы",
        description: "Количество запросов в минуту",
        type: "bar",
        dataSource: "requests",
        size: "small",
        position: { x: 1, y: 2 },
      },
    ],
  }

  // Handle saving dashboard changes
  const handleSaveDashboard = (updatedDashboard) => {
    console.log("Saving dashboard:", updatedDashboard)
    // In a real application, this would save to a database
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="container py-6">
          <DashboardLayout dashboardId={dashboardId} initialData={dashboardData} onSave={handleSaveDashboard} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
