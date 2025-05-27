"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Clock, Edit, Loader2, RefreshCw, Share, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardApi, Dashboard, Panel } from "@/lib/dashboard-api"
import { grafanaApi } from "@/lib/grafana-api"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

// Новый компонент для отображения отдельной панели Grafана
interface GrafanaPanelProps {
  panel: Panel
  dashboardUid: string
  refreshInterval?: number
}

function GrafanaPanel({ panel, dashboardUid, refreshInterval = 0 }: GrafanaPanelProps) {
  const [key, setKey] = useState(Date.now()); // Ключ для принудительного обновления iframe
  const [loading, setLoading] = useState(true);

  // Получаем URL через grafanaApi вместо прямого конструирования
  const panelUrl = grafanaApi.getPanelUrl(dashboardUid, panel.id, {
    refresh: refreshInterval > 0 ? `${refreshInterval}s` : 'off',
    theme: 'dark'
  });

  // Высота панели, рассчитанная на основе gridPos
  const panelHeight = panel.gridPos.h * 50; // 50px на единицу высоты в Grafана

  useEffect(() => {
    // Если задан интервал обновления, создаем таймер
    if (refreshInterval > 0) {
      const timer = setInterval(() => {
        setKey(Date.now()); // Обновляем ключ для перезагрузки iframe
      }, refreshInterval * 1000);

      return () => clearInterval(timer);
    }
  }, [refreshInterval]);

  return (
    <div className="grafana-panel-container" style={{ width: '100%', height: `${panelHeight}px`, minHeight: '200px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <iframe
        key={key}
        src={panelUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        className="grafana-panel"
        onLoad={() => setLoading(false)}
      ></iframe>
    </div>
  );
}

// Главный компонент просмотра дашборда
interface DashboardViewerProps {
  uid: string
}

export function DashboardViewer({ uid }: DashboardViewerProps) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState<number>(0)
  const router = useRouter()

  // Извлекаем интервал обновления из настроек дашборда
  useEffect(() => {
    if (dashboard?.refresh) {
      const refreshValue = dashboard.refresh;
      // Преобразуем строку вида "5s", "30s", "1m" в секунды
      if (refreshValue === "") {
        setAutoRefresh(0); // Автообновление выключено
      } else if (refreshValue.endsWith("s")) {
        setAutoRefresh(parseInt(refreshValue.slice(0, -1)));
      } else if (refreshValue.endsWith("m")) {
        setAutoRefresh(parseInt(refreshValue.slice(0, -1)) * 60);
      } else if (refreshValue.endsWith("h")) {
        setAutoRefresh(parseInt(refreshValue.slice(0, -1)) * 3600);
      }
    }
  }, [dashboard]);

  // Загрузка дашборда
  const loadDashboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await dashboardApi.getDashboard(uid)

      if (response.status === "success" && response.data) {
        console.log("Загружен дашборд:", response.data);
        setDashboard(response.data)
      } else {
        setError(response.message || "Не удалось загрузить дашборд")
      }
    } catch (error) {
      console.error("Ошибка при загрузке дашборда:", error)
      setError("Произошла ошибка при загрузке дашборда")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Загрузка дашборда при монтировании
  useEffect(() => {
    loadDashboard()
  }, [uid])

  // Функция для ручного обновления
  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboard()
  }

  // Если идет загрузка
  if (loading && !dashboard) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Если произошла ошибка
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  // Если дашборд не найден
  if (!dashboard) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Дашборд не найден</AlertTitle>
          <AlertDescription>Запрошенный дашборд не существует или был удален.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/dashboards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Button>
        </div>
      </div>
    )
  }

  // Обработка сетки панелей
  const renderPanels = () => {
    if (!dashboard.panels || dashboard.panels.length === 0) {
      return (
        <div className="col-span-full text-center py-10 border border-dashed rounded-lg">
          <p className="text-muted-foreground">У этого дашборда нет панелей</p>
        </div>
      );
    }

    // Сортируем панели по Y, затем по X для правильного порядка
    const sortedPanels = [...dashboard.panels].sort((a, b) => {
      if (a.gridPos.y === b.gridPos.y) {
        return a.gridPos.x - b.gridPos.x;
      }
      return a.gridPos.y - b.gridPos.y;
    });

    // Группируем панели по строкам (Y-координата)
    const rows: Record<number, Panel[]> = {};
    sortedPanels.forEach(panel => {
      if (!rows[panel.gridPos.y]) {
        rows[panel.gridPos.y] = [];
      }
      rows[panel.gridPos.y].push(panel);
    });

    // Рендерим по строкам
    return Object.entries(rows).map(([yPos, rowPanels]) => (
      <div key={`row-${yPos}`} className="w-full flex flex-wrap gap-4 mb-4">
        {rowPanels.map(panel => {
          // Рассчитываем ширину в процентах от ширины контейнера
          // Grafana использует 24-колоночную сетку
          const widthPercent = (panel.gridPos.w / 24) * 100;

          return (
            <div
              key={panel.id}
              className="panel-wrapper"
              style={{
                width: `calc(${widthPercent}% - 16px)`,
                minWidth: '250px',
                flex: panel.gridPos.w > 12 ? '1 0 100%' : 'none'
              }}
            >
              <Card className="overflow-hidden h-full">
                <CardContent className="p-0">
                  <GrafanaPanel
                    panel={panel}
                    dashboardUid={uid}
                    refreshInterval={autoRefresh}
                  />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    ));
  };

  // Основной рендер дашборда
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{dashboard.title}</h1>
            <Button variant="ghost" size="icon" title="В избранное">
              <Star className="h-4 w-4" />
            </Button>
          </div>
          {dashboard.description && <p className="text-muted-foreground">{dashboard.description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{dashboard.time?.from || "now-6h"} до {dashboard.time?.to || "now"}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboards/${uid}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
          <Button variant="outline" onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            toast.success("Ссылка скопирована в буфер обмена");
          }}>
            <Share className="h-4 w-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </div>

      {/* Теги */}
      {dashboard.tags && dashboard.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dashboard.tags.map(tag => (
            <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
              {tag}
            </div>
          ))}
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="panels">
        <TabsList>
          <TabsTrigger value="panels">Панели</TabsTrigger>
          <TabsTrigger value="info">Информация</TabsTrigger>
        </TabsList>

        <TabsContent value="panels" className="space-y-4 mt-4">
          {renderPanels()}
        </TabsContent>

        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Общая информация</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Создан:</span>
                      <span>{formatDate(dashboard.created || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Обновлен:</span>
                      <span>{formatDate(dashboard.updated || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span>{dashboard.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Версия:</span>
                      <span>{dashboard.version || 1}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Настройки</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Часовой пояс:</span>
                      <span>{dashboard.timezone || 'browser'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Автообновление:</span>
                      <span>{dashboard.refresh || 'off'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Редактируемый:</span>
                      <span>{dashboard.editable ? 'Да' : 'Нет'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Панелей:</span>
                      <span>{dashboard.panels?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
