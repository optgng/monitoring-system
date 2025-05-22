"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { toast } from "@/components/ui/use-toast"

export default function NewDashboardPage() {
  const router = useRouter()

  // Initial empty dashboard data
  const emptyDashboard = {
    id: "new",
    title: "Новый дашборд",
    description: "Описание дашборда",
    panels: [],
  }

  // Handle saving the new dashboard
  const handleSaveDashboard = (dashboard) => {
    console.log("Creating new dashboard:", dashboard)
    // In a real application, this would save to a database and return the new ID
    const newId = Date.now()
    toast({
      title: "Дашборд создан",
      description: "Новый дашборд успешно создан",
    })
    router.push(`/dashboards/${newId}`)
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="container py-6">
          <DashboardLayout dashboardId="new" initialData={emptyDashboard} onSave={handleSaveDashboard} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
