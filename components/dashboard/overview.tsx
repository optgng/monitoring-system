"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import { ApiMetrics } from "@/components/dashboard/api-metrics"
import { AlertsSummary } from "@/components/dashboard/alerts-summary"
import { ServersOverview } from "@/components/dashboard/servers-overview"
import { CpuUsage } from "@/components/dashboard/cpu-usage"
import { MemoryUsage } from "@/components/dashboard/memory-usage"

interface OverviewProps {
  uid: string
  name: string
  description: string
}

const Overview: React.FC<OverviewProps> = ({ uid, name, description }) => {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Основные системные метрики - равномерно распределены по ширине */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServersOverview />
        <CpuUsage />
        <MemoryUsage />
      </div>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsSummary />
        <ApiMetrics />
      </div>
    </div>
  )
}

export default Overview
