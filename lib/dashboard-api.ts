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
      process.env.NEXT_PUBLIC_DASHBOARD_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
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

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      let data

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      return {
        data,
        status: "success",
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        data: null as T,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Dashboard methods
  async listDashboards(): Promise<ApiResponse<DashboardListItem[]>> {
    return this.request<DashboardListItem[]>("/dashboards/")
  }

  async getDashboard(uid: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>(`/dashboards/${uid}`)
  }

  async createDashboard(dashboard: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>("/dashboards/", {
      method: "POST",
      body: JSON.stringify(dashboard),
    })
  }

  async updateDashboard(uid: string, dashboard: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>(`/dashboards/${uid}`, {
      method: "PUT",
      body: JSON.stringify(dashboard),
    })
  }

  async deleteDashboard(uid: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/dashboards/${uid}`, {
      method: "DELETE",
    })
  }

  async duplicateDashboard(uid: string, newTitle?: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>(`/dashboards/${uid}/duplicate`, {
      method: "POST",
      body: JSON.stringify({ title: newTitle }),
    })
  }

  async importDashboard(dashboardJson: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>("/dashboards/import", {
      method: "POST",
      body: JSON.stringify({ dashboard: dashboardJson }),
    })
  }

  async exportDashboard(uid: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/dashboards/${uid}/export`)
  }

  async compareDashboardVersions(uid: string, version1: number, version2: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/dashboards/${uid}/compare?v1=${version1}&v2=${version2}`)
  }

  async visualizeDashboardStructure(uid: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/dashboards/${uid}/visualize`)
  }

  // Panel methods
  async createPanel(dashboardUid: string, panel: Partial<Panel>): Promise<ApiResponse<Panel>> {
    return this.request<Panel>(`/dashboards/${dashboardUid}/panels`, {
      method: "POST",
      body: JSON.stringify(panel),
    })
  }

  async getPanel(dashboardUid: string, panelId: number): Promise<ApiResponse<Panel>> {
    return this.request<Panel>(`/dashboards/${dashboardUid}/panels/${panelId}`)
  }

  async updatePanel(dashboardUid: string, panelId: number, panel: Partial<Panel>): Promise<ApiResponse<Panel>> {
    return this.request<Panel>(`/dashboards/${dashboardUid}/panels/${panelId}`, {
      method: "PUT",
      body: JSON.stringify(panel),
    })
  }

  async deletePanel(dashboardUid: string, panelId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/dashboards/${dashboardUid}/panels/${panelId}`, {
      method: "DELETE",
    })
  }
}

export const dashboardApi = new DashboardApiService()
