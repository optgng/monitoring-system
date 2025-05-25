"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Settings, Plus, Edit, Trash2, Loader2, RefreshCw, Download } from "lucide-react"
import { dashboardApi, type Panel } from "@/lib/dashboard-api"
import { PanelRenderer } from "@/components/dashboard/panel-renderer"
import { useDashboard } from "@/hooks/use-dashboard"
import { getTagColor, getTagBadgeClass, getTagStyle, getTagHoverStyle } from "@/lib/tag-colors"

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardUid = params.uid as string

  const { dashboard, loading, error, loadDashboard } = useDashboard(dashboardUid)

  const [refreshing, setRefreshing] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })

  const refreshDashboard = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  const handleExportDashboard = async () => {
    if (!dashboard) return

    try {
      showResultModal("Экспорт", "Подготовка файла для экспорта...", "success")

      let exportData = null
      let exportMethod = "unknown"

      try {
        // Метод 1: API экспорта
        const response = await dashboardApi.exportDashboard(dashboardUid)
        if (response.status === "success") {
          exportData = response.data
          exportMethod = "api"
        }
      } catch (apiError) {
        console.warn("API export failed, using current dashboard data:", apiError)
      }

      // Метод 2: Используем текущие данные дашборда
      if (!exportData) {
        exportData = {
          dashboard: dashboard,
          meta: {
            type: "db",
            canSave: true,
            canEdit: true,
            url: `/d/${dashboard.uid}/${dashboard.title.toLowerCase().replace(/\s+/g, '-')}`,
            expires: "0001-01-01T00:00:00Z",
            created: dashboard.created || new Date().toISOString(),
            updated: dashboard.updated || new Date().toISOString(),
            version: dashboard.version || 1
          }
        }
        exportMethod = "current"
      }

      // Создаем файл для скачивания
      const exportJson = typeof exportData === 'string'
        ? exportData
        : JSON.stringify(exportData, null, 2)

      const blob = new Blob([exportJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const safeName = dashboard.title.replace(/[^a-zA-Z0-9\-_]/g, '_')
      link.download = `${safeName}_${timestamp}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      const methodText = {
        api: "через API экспорта",
        current: "из текущих данных"
      }[exportMethod]

      showResultModal(
        "Экспорт завершен",
        `Дашборд "${dashboard.title}" успешно экспортирован ${methodText}`,
        "success"
      )
    } catch (error) {
      console.error("Export error:", error)
      showResultModal(
        "Ошибка экспорта",
        error instanceof Error ? error.message : "Произошла ошибка при экспорте дашборда",
        "error"
      )
    }
  }

  const handleAddPanel = () => {
    router.push(`/dashboards/${dashboardUid}/panels/new`)
  }

  const handleEditPanel = (panel: Panel) => {
    router.push(`/dashboards/${dashboardUid}/panels/${panel.id}/edit`)
  }

  const handleDeletePanel = async (panel: Panel) => {
    if (!confirm(`Удалить панель "${panel.title}"?`)) {
      return
    }

    try {
      const response = await dashboardApi.deletePanel(dashboardUid, panel.id)
      if (response.status === "success") {
        await loadDashboard()
        showResultModal("Успех", "Панель успешно удалена", "success")
      } else {
        showResultModal("Ошибка", response.message || "Не удалось удалить панель", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при удалении панели", "error")
    }
  }

  const generateReport = async () => {
    try {
      showResultModal("Информация", "Функция генерации отчетов в разработке", "success")
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при генерации отчета", "error")
    }
  }

  const showResultModal = (title: string, description: string, type: "success" | "error") => {
    setResultModal({ title, description, type })
    setIsResultModalOpen(true)
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Ошибка загрузки: {error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => loadDashboard()}>Попробовать снова</Button>
            <Button variant="outline" onClick={() => router.push("/dashboards")}>
              Вернуться к списку дашбордов
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка дашборда...</span>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Дашборд не найден</p>
          <Button onClick={() => router.push("/dashboards")} className="mt-4">
            Вернуться к списку дашбордов
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dashboard.title}</h1>
          {dashboard.description && <p className="text-muted-foreground">{dashboard.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>UID: {dashboard.uid}</span>
            {dashboard.version && <span>Версия: {dashboard.version}</span>}
            {dashboard.updated && <span>Обновлено: {new Date(dashboard.updated).toLocaleString()}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDashboard} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Обновить
          </Button>

          <Button onClick={handleAddPanel}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить панель
          </Button>


          <Button onClick={generateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Отчет
          </Button>


          <Button variant="outline" onClick={handleExportDashboard}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>

          <Button variant="outline" onClick={() => router.push(`/dashboards/${dashboardUid}/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Настройки
          </Button>
        </div>
      </div>

      {/* Теги дашборда */}
      {dashboard.tags && dashboard.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dashboard.tags.map(tag => {
            const tagStyle = getTagStyle(tag);
            const hoverStyle = { ...tagStyle, ...getTagHoverStyle(tag) };

            return (
              <span
                key={tag}
                style={tagStyle}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, hoverStyle);
                }}
                onMouseOut={(e) => {
                  Object.assign(e.currentTarget.style, tagStyle);
                }}
                onClick={() => {
                  router.push(`/dashboards?tag=${encodeURIComponent(tag)}`);
                }}
                className="cursor-pointer"
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="panels">Панели ({dashboard.panels?.length || 0})</TabsTrigger>
          {dashboard.templating?.list?.length > 0 && (
            <TabsTrigger value="variables">Переменные ({dashboard.templating.list.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {!dashboard.panels || dashboard.panels.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">В дашборде нет панелей</p>
              <Button onClick={handleAddPanel}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить первую панель
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {dashboard.panels
                .sort((a, b) => a.gridPos.y - b.gridPos.y || a.gridPos.x - b.gridPos.x)
                .map((panel) => (
                  <Card key={panel.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{panel.title}</CardTitle>
                          {panel.description && <CardDescription>{panel.description}</CardDescription>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPanel(panel)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePanel(panel)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PanelRenderer panel={panel} />
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="panels" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Управление панелями</h3>

            <Button onClick={handleAddPanel}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить панель
            </Button>

          </div>

          {!dashboard.panels || dashboard.panels.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Панели отсутствуют</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.panels.map((panel) => (
                <Card key={panel.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{panel.title || "Без названия"}</h4>
                      <p className="text-sm text-muted-foreground">
                        Тип: {panel.type} | ID: {panel.id} | Позиция: {panel.gridPos?.x || 0},{panel.gridPos?.y || 0}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPanel(panel)}>
                        Редактировать
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePanel(panel)}>
                        Удалить
                      </Button>
                    </div>

                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {dashboard.templating?.list?.length > 0 && (
          <TabsContent value="variables" className="space-y-4">
            <h3 className="text-lg font-medium">Переменные дашборда</h3>
            <div className="space-y-4">
              {dashboard.templating.list.map((variable) => (
                <Card key={variable.name} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{variable.label || variable.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Тип: {variable.type} | Имя: ${variable.name}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resultModal.title}</DialogTitle>
            <DialogDescription>
              {resultModal.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsResultModalOpen(false)}>
              ОК
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
