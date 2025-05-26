"use server"

import { dashboardApi } from "@/lib/dashboard-api"
import type { ApiResponse, Dashboard, DashboardListItem } from "@/lib/dashboard-api"

// Упрощаем обертку с повторными попытками - убираем дополнительный слой retry
async function withRetry<T>(
  action: () => Promise<ApiResponse<T>>,
  maxRetries: number = 1 // Уменьшаем количество попыток, так как в dashboard-api уже есть retry
): Promise<ApiResponse<T>> {
  let retries = 0
  let lastError: Error | null = null

  while (retries <= maxRetries) {
    try {
      const result = await action()
      // Если получили ответ (даже с ошибкой), возвращаем его
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Если уже исчерпали все попытки, выходим из цикла
      if (retries >= maxRetries) break

      // Увеличиваем счетчик попыток и делаем паузу
      retries++
      await new Promise((resolve) => setTimeout(resolve, 500 * retries)) // Уменьшаем задержку
    }
  }

  console.error(`Server action failed after ${retries} retries:`, lastError)
  return {
    data: null as T,
    status: "error",
    message: lastError?.message || "Не удалось выполнить действие на сервере"
  }
}

export async function getDashboards(): Promise<ApiResponse<DashboardListItem[] | DashboardListItem>> {
  return withRetry(() => dashboardApi.listDashboards())
}

export async function deleteDashboard(uid: string): Promise<ApiResponse<void>> {
  return withRetry(() => dashboardApi.deleteDashboard(uid))
}

export async function duplicateDashboard(uid: string, newTitle?: string): Promise<ApiResponse<Dashboard>> {
  return withRetry(() => dashboardApi.duplicateDashboard(uid, newTitle))
}

export async function createDashboard(dashboard: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
  return withRetry(() => dashboardApi.createDashboard(dashboard))
}

export async function updateDashboard(uid: string, dashboard: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
  return withRetry(() => dashboardApi.updateDashboard(uid, dashboard))
}
