"use client"

import { useState, useEffect, useCallback } from "react"
import { dashboardApi, type DashboardListItem, type Dashboard } from "@/lib/dashboard-api"

export function useDashboards() {
  const [dashboards, setDashboards] = useState<DashboardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboards = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.listDashboards()
      if (response.status === "success") {
        setDashboards(response.data)
      } else {
        setError(response.message || "Не удалось загрузить список дашбордов")
      }
    } catch (err) {
      setError("Произошла ошибка при загрузке дашбордов")
      console.error("Failed to load dashboards:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboards()
  }, [loadDashboards])

  const createDashboard = useCallback(
    async (dashboard: Partial<Dashboard>) => {
      try {
        const response = await dashboardApi.createDashboard(dashboard)
        if (response.status === "success") {
          await loadDashboards() // Перезагружаем список
          return response.data
        } else {
          throw new Error(response.message || "Не удалось создать дашборд")
        }
      } catch (error) {
        console.error("Failed to create dashboard:", error)
        throw error
      }
    },
    [loadDashboards],
  )

  const deleteDashboard = useCallback(async (uid: string) => {
    try {
      const response = await dashboardApi.deleteDashboard(uid)
      if (response.status === "success") {
        setDashboards((prev) => prev.filter((d) => d.uid !== uid))
        return true
      } else {
        throw new Error(response.message || "Не удалось удалить дашборд")
      }
    } catch (error) {
      console.error("Failed to delete dashboard:", error)
      throw error
    }
  }, [])

  const duplicateDashboard = useCallback(
    async (uid: string, newTitle?: string) => {
      try {
        const response = await dashboardApi.duplicateDashboard(uid, newTitle)
        if (response.status === "success") {
          await loadDashboards() // Перезагружаем список
          return response.data
        } else {
          throw new Error(response.message || "Не удалось дублировать дашборд")
        }
      } catch (error) {
        console.error("Failed to duplicate dashboard:", error)
        throw error
      }
    },
    [loadDashboards],
  )

  return {
    dashboards,
    loading,
    error,
    loadDashboards,
    createDashboard,
    deleteDashboard,
    duplicateDashboard,
  }
}
