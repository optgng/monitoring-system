"use client"

import { useState, useEffect } from "react"
import { dashboardApi, type Dashboard, type Panel } from "@/lib/dashboard-api"

export function useDashboard(uid: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = async () => {
    if (!uid) return

    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.getDashboard(uid)
      if (response.status === "success") {
        const dashboardData = response.data as Dashboard
        // Обеспечиваем правильную структуру данных
        setDashboard({
          ...dashboardData,
          panels: dashboardData.panels || [], // Гарантируем наличие массива панелей
          tags: dashboardData.tags || [], // Гарантируем наличие массива тегов
          templating: dashboardData.templating || { list: [] }, // Гарантируем наличие templating
        })
      } else {
        setError(response.message || "Не удалось загрузить дашборд")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }

  const createPanel = async (panelData: Partial<Panel>) => {
    const response = await dashboardApi.createPanel(uid, panelData)
    if (response.status === "success") {
      await loadDashboard() // Перезагружаем дашборд
      return response.data
    } else {
      throw new Error(response.message || "Не удалось создать панель")
    }
  }

  const updatePanel = async (panelId: number, panelData: Partial<Panel>) => {
    const response = await dashboardApi.updatePanel(uid, panelId, panelData)
    if (response.status === "success") {
      await loadDashboard() // Перезагружаем дашборд
      return response.data
    } else {
      throw new Error(response.message || "Не удалось обновить панель")
    }
  }

  const deletePanel = async (panelId: number) => {
    const response = await dashboardApi.deletePanel(uid, panelId)
    if (response.status === "success") {
      await loadDashboard() // Перезагружаем дашборд
    } else {
      throw new Error(response.message || "Не удалось удалить панель")
    }
  }

  const exportDashboard = async () => {
    const response = await dashboardApi.exportDashboard(uid)
    if (response.status === "success") {
      return response.data
    } else {
      throw new Error(response.message || "Не удалось экспортировать дашборд")
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [uid])

  return {
    dashboard,
    loading,
    error,
    loadDashboard,
    createPanel,
    updatePanel,
    deletePanel,
    exportDashboard,
  }
}
