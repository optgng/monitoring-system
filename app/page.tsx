"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Overview } from "@/components/dashboard/overview"

export default function HomePage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <Header />
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Обзор системы</h2>
            </div>
            <Overview />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
