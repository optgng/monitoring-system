"use client"

import { useParams } from "next/navigation"
import { EnhancedDashboardEditor } from "@/components/dashboard/enhanced-dashboard-editor"

export default function DashboardEditPage() {
  const params = useParams()
  const dashboardUid = params.uid as string

  return (
    <div className="container mx-auto py-6">
      <EnhancedDashboardEditor uid={dashboardUid} isCreating={false} />
    </div>
  )
}
