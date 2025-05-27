// Типы для API дашбордов
export interface Dashboard {
  id?: number
  uid?: string
  title: string
  description?: string
  tags?: string[]
  timezone?: string
  panels?: Panel[]
  editable?: boolean
  graphTooltip?: number
  time?: {
    from?: string
    to?: string
  }
  refresh?: string
  templating?: {
    list: any[]
  }
  annotations?: {
    list: any[]
  }
  timepicker?: {
    refresh_intervals?: string[]
    time_options?: string[]
  }
  schemaVersion?: number
  version?: number
  style?: string
  links?: any[]
  hideControls?: boolean
  fiscalYearStartMonth?: number
  liveNow?: boolean
  weekStart?: string
  created?: string
  updated?: string
  metadata?: any
  panelCount?: number
}

export interface Target {
  refId: string
  expr: string
  interval?: string
  legendFormat?: string
  datasource: {
    type: string
    uid: string
  }
}

export interface Panel {
  id: number
  title: string
  description?: string
  type: string // Используем современные типы: "timeseries", "stat", "gauge", "table" и т.д.
  datasource: {
    type: string
    uid: string
  }
  targets?: Target[]
  gridPos: {
    h: number
    w: number
    x: number
    y: number
  }
  options?: any
  fieldConfig?: any
  transparent?: boolean
}

export interface DashboardListItem {
  uid: string
  title: string
  description?: string
  tags: string[]
  isStarred?: boolean
  uri?: string
  url?: string
  folderId?: number
  folderTitle?: string
  created?: string
  updated?: string
  panelCount?: number
  dashboard?: Dashboard // Добавлено для поддержки вложенного dashboard
}

// Типы для ответов API
export interface ApiResponse<T> {
  data: T
  message?: string
  status: "success" | "error"
}

// Определяем тип RequestOptions для использования в fetch-запросах
export interface RequestOptions extends RequestInit {
  retry?: number
  headers?: HeadersInit
}

// Обновление класса DashboardApiService для корректной работы с FastAPI Dashboards Service
class DashboardApiService {
  private apiUrl: string
  private defaultRetry: number

  constructor(
    apiUrl: string = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:8050/api',
    defaultRetry: number = 3
  ) {
    this.apiUrl = apiUrl
    this.defaultRetry = defaultRetry
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}) {
    const url = this.apiUrl + endpoint;

    // Создаем новый объект headers для избежания проблем с типизацией
    const headersObj: Record<string, string> = { 'Content-Type': 'application/json' };

    // Правильно копируем заголовки из options.headers, если они существуют
    if (options.headers) {
      // Если headers - это экземпляр Headers
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
      }
      // Если headers - это простой объект
      else if (typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headersObj[key] = value;
          }
        });
      }
    }

    try {
      const retryCount = options.retry ?? this.defaultRetry;

      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          let response = await fetch(url, {
            ...options,
            headers: headersObj
          });

          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorText = response.statusText;

            try {
              // Попытка распарсить JSON в ошибке
              if (contentType?.includes('application/json')) {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);

                // Если это ошибка валидации, сделаем ее более понятной
                if (response.status === 422 && errorData.detail) {
                  const fieldErrors = errorData.detail.map((err: any) => {
                    return `Поле ${err.loc.join('.')} ${err.msg}`;
                  }).join('; ');

                  throw new Error(`Ошибка валидации: ${fieldErrors}`);
                }
              } else {
                errorText = await response.text();
              }
            } catch (parseError) {
              console.error('Ошибка при парсинге ответа:', parseError);
            }

            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return data as T;
          } else {
            return await response.text() as unknown as T;
          }
        } catch (error) {
          if (attempt === retryCount) {
            throw error;
          }
          console.warn(`Retry ${attempt + 1}/${retryCount + 1} after error:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      throw new Error(`Request failed after ${retryCount + 1} attempts`);
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Методы для работы с дашбордами

  // Обновляем метод для получения списка дашбордов с получением статистики для каждого дашборда
  async listDashboards(filters: Record<string, any> = {}): Promise<ApiResponse<DashboardListItem[]>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      // Добавляем логирование для отладки
      console.log(`Запрос к API: ${this.apiUrl}/api/${query}`);

      const response = await this.request<any>(`/api/${query}`);
      console.log("Исходный ответ API:", response);

      // Проверяем формат ответа и приводим его к нужному формату
      let dashboards: DashboardListItem[] = [];

      if (response.status === "success") {
        // Если ответ содержит вложенное поле data, которое является массивом
        if (Array.isArray(response.data)) {
          dashboards = response.data;
        }
        // Если ответ содержит объект с полем dashboards, которое является массивом
        else if (response.data && Array.isArray(response.data.dashboards)) {
          dashboards = response.data.dashboards;
        }
        // Если ответ содержит объект с полем result, которое является массивом
        else if (response.data && Array.isArray(response.data.result)) {
          dashboards = response.data.result;
        }
        // Если ответ содержит один дашборд как объект
        else if (response.data && typeof response.data === 'object' && response.data.uid) {
          dashboards = [response.data];
        }
        // Если data вообще не существует, но сам response является массивом
        else if (Array.isArray(response)) {
          dashboards = response;
        }
        // Если сам response является объектом и содержит uid
        else if (typeof response === 'object' && response.uid) {
          dashboards = [response];
        }
      } else {
        // В случае если ответ напрямую представляет собой массив (без обертки status/data)
        if (Array.isArray(response)) {
          dashboards = response;
        }
      }

      console.log("Обработанные дашборды:", dashboards);

      // Убедимся, что все дашборды имеют необходимые поля
      dashboards = dashboards.map(dashboard => {
        // Определим количество панелей - проверим все возможные источники этого значения
        let panelCount = 0;
        if (typeof dashboard.panelCount === 'number') {
          panelCount = dashboard.panelCount;
        } else if (dashboard.dashboard && Array.isArray(dashboard.dashboard.panels)) {
          // Иногда панели могут быть вложены в поле dashboard
          panelCount = dashboard.dashboard.panels.length;
        }

        return {
          uid: dashboard.uid || '',
          title: dashboard.title || 'Без названия',
          description: dashboard.description || '',
          tags: dashboard.tags || [],
          url: dashboard.url || '',
          isStarred: dashboard.isStarred || false,
          created: dashboard.created || '',
          updated: dashboard.updated || '',
          panelCount: panelCount // Используем вычисленное значение
        };
      });

      // После получения списка дашбордов, загрузим статистику для каждого
      try {
        const enrichedDashboards = [];

        for (const dashboard of dashboards) {
          try {
            // Получаем статистику дашборда
            const stats = await this.getDashboardStats(dashboard.uid);

            // Если статистика получена успешно, берем количество панелей из неё
            if (stats.status === "success" && stats.data.total_panels !== undefined) {
              enrichedDashboards.push({
                ...dashboard,
                panelCount: stats.data.total_panels
              });
            } else {
              // Иначе используем существующее значение или количество панелей из свойства panels
              enrichedDashboards.push({
                ...dashboard,
                panelCount: dashboard.panelCount || 0
              });
            }
          } catch (error) {
            console.warn(`Не удалось получить статистику для дашборда ${dashboard.uid}:`, error);
            enrichedDashboards.push(dashboard);
          }
        }

        return {
          status: "success",
          data: enrichedDashboards,
          message: ""
        };
      } catch (error) {
        console.error("Ошибка при обогащении данных дашбордов:", error);
        return {
          status: "success",
          data: dashboards.map(dashboard => ({
            ...dashboard,
            panelCount: dashboard.panelCount || 0
          })),
          message: ""
        };
      }
    } catch (error) {
      console.error("Ошибка при получении списка дашбордов:", error);
      return {
        status: "error",
        data: [],
        message: error instanceof Error ? error.message : "Неизвестная ошибка"
      };
    }
  }

  async listDashboardsWithFilters(filters: Record<string, any> = {}): Promise<ApiResponse<DashboardListItem[]>> {
    return this.listDashboards(filters);
  }

  async createDashboard(dashboardData: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    // Формируем правильную структуру запроса согласно API
    const requestData = {
      dashboard: {
        title: dashboardData.title,
        description: dashboardData.description || "",
        tags: dashboardData.tags || [],
        style: dashboardData.style || "dark",
        timezone: dashboardData.timezone || "browser",
        editable: dashboardData.editable !== false,
        hideControls: dashboardData.hideControls || false,
        graphTooltip: dashboardData.graphTooltip || 0,
        time: dashboardData.time || {
          from: "now-6h",
          to: "now"
        },
        timepicker: dashboardData.timepicker || {
          refresh_intervals: ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"],
          time_options: ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
        },
        templating: dashboardData.templating || { list: [] },
        annotations: dashboardData.annotations || { list: [] },
        refresh: dashboardData.refresh || "30s",
        schemaVersion: dashboardData.schemaVersion || 36,
        version: dashboardData.version || 0,
        panels: dashboardData.panels || [],
        links: dashboardData.links || [],
        fiscalYearStartMonth: dashboardData.fiscalYearStartMonth || 0,
        liveNow: dashboardData.liveNow || false,
        weekStart: dashboardData.weekStart || ""
      },
      folderId: 0,
      overwrite: false
    };

    return this.request<ApiResponse<Dashboard>>('/api/', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async getDashboard(uid: string): Promise<ApiResponse<Dashboard>> {
    try {
      const response = await this.request<any>(`/api/${uid}`);
      console.log('Исходный ответ API getDashboard:', response);

      // Проверим разные форматы ответа и правильно их обработаем
      let dashboardData: Dashboard;

      if (response.dashboard) {
        // Случай когда дашборд вложен в поле dashboard
        dashboardData = response.dashboard;
      } else if (response.data && response.data.dashboard) {
        // Случай когда дашборд вложен в data.dashboard
        dashboardData = response.data.dashboard;
      } else if (response.data) {
        // Случай когда дашборд находится в data
        dashboardData = response.data;
      } else {
        // Прямой ответ от API
        dashboardData = response;
      }

      // Убедимся, что дашборд имеет необходимые поля
      dashboardData.panels = dashboardData.panels || [];
      dashboardData.tags = dashboardData.tags || [];
      dashboardData.templating = dashboardData.templating || { list: [] };

      return {
        status: "success",
        data: dashboardData,
        message: response.message || ""
      };
    } catch (error) {
      console.error("Ошибка при получении дашборда:", error);
      return {
        status: "error",
        data: {} as Dashboard,
        message: error instanceof Error ? error.message : "Неизвестная ошибка"
      };
    }
  }

  async updateDashboard(uid: string, dashboardData: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    // Получаем текущие данные дашборда
    const currentDashboard = await this.getDashboard(uid);

    // Формируем обновленный дашборд с сохранением текущих данных
    const updatedDashboard = {
      dashboard: {
        ...currentDashboard.data,
        ...dashboardData,
        title: dashboardData.title || currentDashboard.data.title,
        uid: uid,
        version: (currentDashboard.data.version || 0) + 1
      },
      folderId: 0,
      overwrite: true
    };

    return this.request<ApiResponse<Dashboard>>(`/api/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(updatedDashboard)
    });
  }

  async deleteDashboard(uid: string): Promise<ApiResponse<{}>> {
    return this.request<ApiResponse<{}>>(`/api/${uid}`, {
      method: 'DELETE'
    });
  }

  async duplicateDashboard(uid: string, newTitle?: string): Promise<ApiResponse<Dashboard>> {
    const data = newTitle ? { title: newTitle } : undefined;
    return this.request<ApiResponse<Dashboard>>(`/api/${uid}/duplicate`, {
      method: 'POST',
      ...(data && { body: JSON.stringify(data) })
    });
  }

  // Методы для работы с панелями

  async createPanel(dashboardUid: string, panelData: Partial<Panel>): Promise<ApiResponse<Panel>> {
    // Убедимся, что у панели есть datasource
    const panel = {
      ...panelData,
      datasource: panelData.datasource || {
        type: "prometheus",
        uid: "prometheus"
      },
      // Убедимся, что у каждого target есть datasource
      targets: panelData.targets?.map(target => ({
        ...target,
        datasource: target.datasource || {
          type: "prometheus",
          uid: "prometheus"
        }
      })) || []
    };

    return this.request<ApiResponse<Panel>>(`/api/${dashboardUid}/panels`, {
      method: 'POST',
      body: JSON.stringify(panel)
    });
  }

  async getPanel(dashboardUid: string, panelId: number): Promise<ApiResponse<Panel>> {
    return this.request<ApiResponse<Panel>>(`/api/${dashboardUid}/panels/${panelId}`);
  }

  async updatePanel(dashboardUid: string, panelId: number, panelData: Partial<Panel>): Promise<ApiResponse<Panel>> {
    // Убедимся, что у панели есть datasource
    const panel = {
      ...panelData,
      id: panelId,
      datasource: panelData.datasource || {
        type: "prometheus",
        uid: "prometheus"
      },
      // Убедимся, что у каждого target есть datasource
      targets: panelData.targets?.map(target => ({
        ...target,
        datasource: target.datasource || {
          type: "prometheus",
          uid: "prometheus"
        }
      })) || []
    };

    return this.request<ApiResponse<Panel>>(`/api/${dashboardUid}/panels/${panelId}`, {
      method: 'PUT',
      body: JSON.stringify(panel)
    });
  }

  async deletePanel(dashboardUid: string, panelId: number): Promise<ApiResponse<{}>> {
    return this.request<ApiResponse<{}>>(`/api/${dashboardUid}/panels/${panelId}`, {
      method: 'DELETE'
    });
  }

  // Экспорт и импорт дашбордов

  async exportDashboard(uid: string): Promise<ApiResponse<Dashboard>> {
    return this.request<ApiResponse<Dashboard>>(`/api/${uid}/export`);
  }

  // PromQL хелперы

  async validatePromQLQuery(query: string): Promise<ApiResponse<{ valid: boolean, warnings: string[] }>> {
    return this.request<ApiResponse<{ valid: boolean, warnings: string[] }>>('/api/promql/validate', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  async getPromQLExamples(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/api/promql/examples');
  }

  async getPromQLTemplate(metricType: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/promql/templates/${metricType}`);
  }

  // Добавленный метод для получения статистики дашборда
  async getDashboardStats(uid: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<any>(`/api/${uid}/stats`);
      console.log('Статистика дашборда:', response);

      return {
        status: "success",
        data: response,
        message: ""
      };
    } catch (error) {
      console.error("Ошибка при получении статистики дашборда:", error);
      return {
        status: "error",
        data: {},
        message: error instanceof Error ? error.message : "Неизвестная ошибка"
      };
    }
  }
}

export const dashboardApi = new DashboardApiService();
