"use client"

import { useParams } from "next/navigation"
import { DashboardViewer } from "@/components/dashboard/dashboard-viewer"

export default function DashboardDetailPage() {
  const params = useParams()
  const dashboardUid = params.uid as string

  return <DashboardViewer uid={dashboardUid} />
}
