// Типы для API дашбордов
export interface Dashboard {
  uid: string
  id?: number
  title: string
  description?: string
  tags?: string[]
  timezone?: string
  refresh?: string
  time?: {
    from: string
    to: string
  }
  templating?: {
    list: Variable[]
  }
  annotations?: {
    list: Annotation[]
  }
  panels: Panel[]
  version?: number
  created?: string
  updated?: string
  createdBy?: string
  updatedBy?: string
  editable?: boolean
  gnetId?: number
  graphTooltip?: number
  hideControls?: boolean
  links?: any[]
  schemaVersion?: number
  style?: string
  fiscalYearStartMonth?: number
}

export interface Panel {
  id: number
  title: string
  type: string
  description?: string
  transparent?: boolean
  gridPos: {
    h: number
    w: number
    x: number
    y: number
  }
  targets: Target[]
  fieldConfig: {
    defaults: any
    overrides: any[]
  }
  options: any
  pluginVersion?: string
  datasource?: any
}

export interface Target {
  expr: string
  refId: string
  legendFormat?: string
  interval?: string
  format?: string
  instant?: boolean
}

export interface Variable {
  name: string
  type: string
  label?: string
  description?: string
  query?: string
  datasource?: string
  refresh?: number
  sort?: number
  multi?: boolean
  includeAll?: boolean
  allValue?: string
  options?: any[]
  current?: any
  hide?: number
}

export interface Annotation {
  name: string
  datasource: string
  enable: boolean
  expr?: string
  titleFormat?: string
  textFormat?: string
  tagsField?: string
  timeField?: string
  iconColor?: string
  type?: string
}

export interface DashboardListItem {
  uid: string
  id: number
  title: string
  description?: string
  tags: string[]
  isStarred: boolean
  url: string
  folderId?: number
  folderTitle?: string
  folderUrl?: string
  type: string
  created: string
  updated: string
  panels?: Panel[] // Добавляем панели для корректного подсчета
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: "success" | "error"
}

class DashboardApiService {
  private baseUrl: string

  constructor() {
    // Используем переменную окружения для API дашбордов
    this.baseUrl =
      process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "http://localhost:8050"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    // Получаем токен из сессии (если используется NextAuth)
    const session = typeof window !== "undefined" ? await import("next-auth/react").then((m) => m.getSession()) : null

    const defaultHeaders = {
      "Content-Type": "application/json",
      // Добавляем авторизацию если есть токен
      ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
    }

    // Настройки для повторных попыток
    const maxRetries = 2;
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= maxRetries) {
      try {
        // Создаем timeout с AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Увеличиваем таймаут до 15 секунд

        const response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...(options.headers || {})  // Исправляем синтаксическую ошибку здесь
          },
          signal: controller.signal
        });

        // Очищаем таймаут после завершения запроса
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return {
          data,
          status: "success",
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Если это не таймаут или уже исчерпали все попытки, выходим из цикла
        if (!(error instanceof Error && error.name === "AbortError") || retries >= maxRetries) {
          break;
        }

        // Увеличиваем счетчик попыток и делаем паузу перед следующей попыткой
        retries++;
        await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Экспоненциальная задержка
        console.log(`Retry ${retries}/${maxRetries} for ${endpoint}...`);
      }
    }

    console.error(`API request failed for ${endpoint} after ${retries} retries:`, lastError);

    // Определяем более понятное сообщение об ошибке для пользователя
    let errorMessage = "Неизвестная ошибка";
    if (lastError) {
      if (lastError.name === "AbortError" || lastError.message.includes("timeout")) {
        errorMessage = "Превышено время ожидания ответа от сервера. Проверьте доступность сервиса дашбордов.";
      } else if (lastError.message.includes("fetch failed")) {
        errorMessage = "Не удалось подключиться к сервису дашбордов. Проверьте, запущен ли сервис.";
      } else {
        errorMessage = lastError.message;
      }
    }

    return {
      data: null as T,
      status: "error",
      message: errorMessage,
    };
  }

  // Dashboard methods
  async listDashboards(): Promise<ApiResponse<DashboardListItem[]>> {
    return this.request<DashboardListItem[]>("/api/")
  }

  async getDashboard(uid?: string): Promise<ApiResponse<Dashboard | DashboardListItem[]>> {
    if (uid) {
      const response = await this.request<any>(`/api/${uid}`)
      if (response.status === "success") {
        // Извлекаем dashboard из response (API возвращает объект с meta и dashboard)
        const dashboardData = response.data.dashboard || response.data
        return {
          ...response,
          data: dashboardData
        }
      }
      return response
    } else {
      return this.request<DashboardListItem[]>("/api/")
    }
  }

  async createDashboard(dashboard: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    // Обертываем данные согласно API схеме
    const payload = {
      dashboard: {
        title: dashboard.title,
        description: dashboard.description,
        tags: dashboard.tags || [],
        timezone: dashboard.timezone || "browser",
        schemaVersion: dashboard.schemaVersion || 16,
        refresh: dashboard.refresh,
        time: dashboard.time,
        panels: dashboard.panels || []
      },
      folderId: 0,
      overwrite: true,
      message: "Created via WebUI"
    }

    const response = await this.request<any>("/api/", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (response.status === "success") {
      // Извлекаем dashboard из response
      const dashboardData = response.data.dashboard || response.data
      return {
        ...response,
        data: dashboardData
      }
    }
    return response
  }

  async updateDashboard(uid: string, dashboard: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    // Обертываем данные согласно API схеме
    const payload = {
      dashboard: {
        title: dashboard.title,
        description: dashboard.description,
        tags: dashboard.tags || [],
        timezone: dashboard.timezone || "browser",
        schemaVersion: dashboard.schemaVersion || 16,
        refresh: dashboard.refresh,
        time: dashboard.time,
        panels: dashboard.panels || []
      },
      folderId: 0,
      overwrite: true,
      message: "Updated via WebUI"
    }

    const response = await this.request<any>(`/api/${uid}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })

    if (response.status === "success") {
      // Извлекаем dashboard из response
      const dashboardData = response.data.dashboard || response.data
      return {
        ...response,
        data: dashboardData
      }
    }
    return response
  }

  async deleteDashboard(uid: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/${uid}`, {
      method: "DELETE",
    })
  }

  async duplicateDashboard(uid: string, newTitle?: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>(`/api/${uid}/duplicate`, {
      method: "POST",
      body: newTitle ? JSON.stringify({ title: newTitle }) : undefined,
    })
  }

  async importDashboard(dashboardJson: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>("/api/import", {
      method: "POST",
      body: JSON.stringify({ dashboard: dashboardJson }),
    })
  }

  async exportDashboard(uid: string): Promise<ApiResponse<any>> {
    try {
      // Сначала пытаемся использовать встроенный экспорт API
      const exportResponse = await this.request<any>(`/api/${uid}/export`)
      if (exportResponse.status === "success") {
        return exportResponse
      }

      // Если экспорт через API не работает, получаем данные дашборда напрямую
      console.warn("API export failed, using direct dashboard fetch")
      const dashboardResponse = await this.getDashboard(uid)
      if (dashboardResponse.status === "success") {
        return {
          status: "success",
          data: dashboardResponse.data,
          message: "Dashboard exported successfully (direct method)"
        }
      }

      return dashboardResponse
    } catch (error) {
      console.error("Export failed:", error)
      // Fallback - пытаемся получить дашборд напрямую
      const dashboardResponse = await this.getDashboard(uid)
      if (dashboardResponse.status === "success") {
        return {
          status: "success",
          data: dashboardResponse.data,
          message: "Dashboard exported successfully (fallback method)"
        }
      }

      return {
        data: null as any,
        status: "error",
        message: error instanceof Error ? error.message : "Export failed"
      }
    }
  }

  async compareDashboardVersions(uid: string, version1: number, version2: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/${uid}/compare?version1=${version1}&version2=${version2}`)
  }

  async visualizeDashboardStructure(uid: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/${uid}/visualize`)
  }

  // Panel methods
  async createPanel(dashboardUid: string, panel: Partial<Panel>): Promise<ApiResponse<Panel>> {
    // Подготавливаем данные панели согласно API
    const panelData = {
      title: panel.title,
      type: panel.type,
      datasource: panel.datasource || {
        type: "prometheus",
        uid: "prometheus"
      },
      targets: panel.targets || [],
      gridPos: panel.gridPos || { h: 8, w: 12, x: 0, y: 0 },
      options: panel.options || {}
    }

    return this.request<Panel>(`/api/${dashboardUid}/panels`, {
      method: "POST",
      body: JSON.stringify(panelData),
    })
  }

  async getPanel(dashboardUid: string, panelId: number): Promise<ApiResponse<Panel>> {
    return this.request<Panel>(`/api/${dashboardUid}/panels/${panelId}`)
  }

  async updatePanel(dashboardUid: string, panelId: number, panel: Partial<Panel>): Promise<ApiResponse<Panel>> {
    // Подготавливаем данные панели согласно API
    const panelData = {
      title: panel.title,
      type: panel.type,
      datasource: panel.datasource,
      targets: panel.targets || [],
      gridPos: panel.gridPos,
      options: panel.options || {}
    }

    return this.request<Panel>(`/api/${dashboardUid}/panels/${panelId}`, {
      method: "PUT",
      body: JSON.stringify(panelData),
    })
  }

  async deletePanel(dashboardUid: string, panelId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/${dashboardUid}/panels/${panelId}`, {
      method: "DELETE",
    })
  }

  // Metrics methods
  async getMetrics(): Promise<ApiResponse<string>> {
    return this.request<string>("/api/metrics")
  }

  async getMetricsJson(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/metrics/json")
  }

  async getMetricsSummary(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/metrics/summary")
  }
}

export const dashboardApi = new DashboardApiService()
