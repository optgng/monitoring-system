import { DashboardSettings } from "@/components/dashboard/dashboard-settings"

interface DashboardSettingsPageProps {
  params: {
    id: string
  }
}

export default function DashboardSettingsPage({ params }: DashboardSettingsPageProps) {
  // In a real application, you would fetch the dashboard data here
  const mockDashboardData = {
    title: "System Overview",
    description: "A dashboard showing system performance metrics",
    type: "system",
    isPublic: false,
    refreshInterval: "300",
    permissions: ["admin", "manager"],
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardSettings
        dashboardId={params.id}
        initialData={mockDashboardData}
        onSave={(data) => {
          console.log("Saving dashboard settings:", data)
          // In a real application, you would save the data to the database here
        }}
        onDelete={() => {
          console.log("Deleting dashboard:", params.id)
          // In a real application, you would delete the dashboard from the database here
        }}
      />
    </div>
  )
}
