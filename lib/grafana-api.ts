

/**
 * Сервис для прямого взаимодействия с Grafana API
 * ВАЖНО: Используется ТОЛЬКО для просмотра панелей и прямых подключений к Grafana
 */
export class GrafanaApiService {
  private grafanaUrl: string;
  private apiKey?: string;
  private authMode: string;
  private username?: string;
  private password?: string;

  constructor() {
    this.grafanaUrl = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001';
    this.apiKey = process.env.NEXT_PUBLIC_GRAFANA_API_KEY || '';
    this.authMode = process.env.NEXT_PUBLIC_GRAFANA_AUTH_MODE || 'apikey';
    this.username = process.env.NEXT_PUBLIC_GRAFANA_USERNAME || 'admin';
    this.password = process.env.NEXT_PUBLIC_GRAFANA_PASSWORD || 'admin';
  }

  /**
   * Получает URL для отображения панели в iframe
   */
  getPanelUrl(dashboardUid: string, panelId: number, options?: {
    refresh?: string;
    theme?: 'light' | 'dark';
    timeFrom?: string;
    timeTo?: string;
  }): string {
    const defaultOptions = {
      refresh: 'off',
      theme: 'dark',
      timeFrom: 'now-6h',
      timeTo: 'now'
    };

    const opt = { ...defaultOptions, ...options };

    const params = new URLSearchParams({
      panelId: panelId.toString(),
      refresh: opt.refresh,
      theme: opt.theme,
      from: opt.timeFrom,
      to: opt.timeTo
    });

    return `${this.grafanaUrl}/d-solo/${dashboardUid}?${params.toString()}`;
  }

  /**
   * Получает заголовки авторизации для Grafana API
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.authMode === 'apikey' && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.authMode === 'basic' && this.username && this.password) {
      const base64Auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      headers['Authorization'] = `Basic ${base64Auth}`;
    }

    return headers;
  }

  /**
   * Проверяет доступность Grafana
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.grafanaUrl}/api/health`, {
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data.database === 'ok';
      }
      return false;
    } catch (error) {
      console.error('Failed to check Grafana health:', error);
      return false;
    }
  }
}

export const grafanaApi = new GrafanaApiService();
