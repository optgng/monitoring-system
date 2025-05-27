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
      console.log('Полученный ответ от getDashboard:', response); // Для отладки

      if (response.status === "success") {
        // Правильно обрабатываем структуру ответа API
        // В зависимости от API, данные могут быть в response.data или в response.data.dashboard
        let dashboardData: Dashboard;

        // Проверяем, есть ли поле dashboard в response.data (а не в типе Dashboard)
        if ((response.data as any).dashboard) {
          // Если данные вложены в поле dashboard
          dashboardData = (response.data as any).dashboard;
        } else {
          // Если данные находятся прямо в поле data
          dashboardData = response.data;
        }

        // Обеспечиваем правильную структуру данных
        setDashboard({
          ...dashboardData,
          panels: dashboardData.panels || [], // Гарантируем наличие массива панелей
          tags: dashboardData.tags || [], // Гарантируем наличие массива тегов
          templating: dashboardData.templating || { list: [] }, // Гарантируем наличие templating
        })
      } else {
        setError(response.message || "Не удалось загрузить дашборд")
        console.error("Ошибка загрузки дашборда:", response.message);
      }
    } catch (err) {
      console.error("Ошибка при загрузке дашборда:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }

  const createPanel = async (panelData: Partial<Panel>) => {
    // Убедимся, что у панели есть все необходимые поля
    const completePanel: Partial<Panel> = {
      ...panelData,
      // Добавим datasource, если он отсутствует
      datasource: panelData.datasource || {
        type: "prometheus",
        uid: "prometheus",
      },
      // Убедимся, что у targets есть datasource
      targets:
        panelData.targets?.map((target) => ({
          ...target,
          datasource: target.datasource || {
            type: "prometheus",
            uid: "prometheus",
          },
        })) || [
          {
            refId: "A",
            expr: "",
            datasource: {
              type: "prometheus",
              uid: "prometheus",
            },
          },
        ],
    }

    const response = await dashboardApi.createPanel(uid, completePanel)
    if (response.status === "success") {
      await loadDashboard() // Перезагружаем дашборд
      return response.data
    } else {
      throw new Error(response.message || "Не удалось создать панель")
    }
  }

  const updatePanel = async (panelId: number, panelData: Partial<Panel>) => {
    // Убедимся, что у панели есть все необходимые поля
    const completePanel: Partial<Panel> = {
      ...panelData,
      // Добавим datasource, если он отсутствует
      datasource: panelData.datasource || {
        type: "prometheus",
        uid: "prometheus",
      },
    }

    const response = await dashboardApi.updatePanel(uid, panelId, completePanel)
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
