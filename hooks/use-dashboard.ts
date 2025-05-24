"use client"

import { useState, useEffect, useCallback } from "react"
import { dashboardApi, type Dashboard, type Panel } from "@/lib/dashboard-api"

export function useDashboard(uid: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    if (!uid) return

    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.getDashboard(uid)
      if (response.status === "success") {
        setDashboard(response.data)
      } else {
        setError(response.message || "Не удалось загрузить дашборд")
      }
    } catch (err) {
      setError("Произошла ошибка при загрузке дашборда")
      console.error("Failed to load dashboard:", err)
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const updateDashboard = useCallback(
    async (updates: Partial<Dashboard>) => {
      if (!uid) return

      try {
        const response = await dashboardApi.updateDashboard(uid, updates)
        if (response.status === "success") {
          setDashboard(response.data)
          return response.data
        } else {
          throw new Error(response.message || "Не удалось обновить дашборд")
        }
      } catch (error) {
        console.error("Failed to update dashboard:", error)
        throw error
      }
    },
    [uid],
  )

  const createPanel = useCallback(
    async (panel: Partial<Panel>) => {
      if (!uid) return

      try {
        const response = await dashboardApi.createPanel(uid, panel)
        if (response.status === "success") {
          await loadDashboard() // Перезагружаем дашборд
          return response.data
        } else {
          throw new Error(response.message || "Не удалось создать панель")
        }
      } catch (error) {
        console.error("Failed to create panel:", error)
        throw error
      }
    },
    [uid, loadDashboard],
  )

  const updatePanel = useCallback(
    async (panelId: number, updates: Partial<Panel>) => {
      if (!uid) return

      try {
        const response = await dashboardApi.updatePanel(uid, panelId, updates)
        if (response.status === "success") {
          await loadDashboard() // Перезагружаем дашборд
          return response.data
        } else {
          throw new Error(response.message || "Не удалось обновить панель")
        }
      } catch (error) {
        console.error("Failed to update panel:", error)
        throw error
      }
    },
    [uid, loadDashboard],
  )

  const deletePanel = useCallback(
    async (panelId: number) => {
      if (!uid) return

      try {
        const response = await dashboardApi.deletePanel(uid, panelId)
        if (response.status === "success") {
          await loadDashboard() // Перезагружаем дашборд
          return true
        } else {
          throw new Error(response.message || "Не удалось удалить панель")
        }
      } catch (error) {
        console.error("Failed to delete panel:", error)
        throw error
      }
    },
    [uid, loadDashboard],
  )

  const exportDashboard = useCallback(async () => {
    if (!uid) return

    try {
      const response = await dashboardApi.exportDashboard(uid)
      if (response.status === "success") {
        return response.data
      } else {
        throw new Error(response.message || "Не удалось экспортировать дашборд")
      }
    } catch (error) {
      console.error("Failed to export dashboard:", error)
      throw error
    }
  }, [uid])

  return {
    dashboard,
    loading,
    error,
    loadDashboard,
    updateDashboard,
    createPanel,
    updatePanel,
    deletePanel,
    exportDashboard,
  }
}
