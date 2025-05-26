"use client"

import { EnhancedDashboardEditor } from "@/components/dashboard/enhanced-dashboard-editor"

export default function NewDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <EnhancedDashboardEditor isCreating={true} />
    </div>
  )
}
