"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Settings, Plus, Edit, Trash2, Loader2, RefreshCw, Download } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { Modal } from "@/components/ui/modal"
import { AlertModal } from "@/components/ui/alert-modal"
import type { Panel } from "@/lib/dashboard-api"
import { PanelRenderer } from "@/components/dashboard/panel-renderer"
import { PanelEditor } from "@/components/dashboard/panel-editor"
import { useDashboard } from "@/hooks/use-dashboard"

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardUid = params.uid as string
  const userRole = getCurrentUser().role

  const { dashboard, loading, error, loadDashboard, createPanel, updatePanel, deletePanel, exportDashboard } =
    useDashboard(dashboardUid)

  const [refreshing, setRefreshing] = useState(false)
  const [isAddPanelModalOpen, setIsAddPanelModalOpen] = useState(false)
  const [isEditPanelModalOpen, setIsEditPanelModalOpen] = useState(false)
  const [isDeletePanelModalOpen, setIsDeletePanelModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null)

  // Удалите useEffect и loadDashboard - они теперь в хуке

  const refreshDashboard = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  const handleExportDashboard = async () => {
    try {
      const exportData = await exportDashboard()
      if (exportData) {
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(exportData)
        const exportFileDefaultName = `dashboard-${dashboard?.title || "untitled"}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()

        showResultModal("Дашборд экспортирован", "Дашборд был успешно экспортирован")
      }
    } catch (error) {
      showResultModal(
        "Ошибка экспорта",
        error instanceof Error ? error.message : "Не удалось экспортировать дашборд",
        "error",
      )
    }
  }

  const showResultModal = (title: string, description: string, type: "success" | "error" = "success") => {
    setResultModal({ title, description, type })
    setIsResultModalOpen(true)
  }

  const generateReport = () => {
    router.push(`/reports?dashboard=${dashboardUid}`)
  }

  // Panel management
  const handleAddPanel = () => {
    setSelectedPanel(null)
    setIsAddPanelModalOpen(true)
  }

  const handleEditPanel = (panel: Panel) => {
    setSelectedPanel(panel)
    setIsEditPanelModalOpen(true)
  }

  const handleDeletePanel = (panel: Panel) => {
    setSelectedPanel(panel)
    setIsDeletePanelModalOpen(true)
  }

  const handleSavePanel = async (panelData: Partial<Panel>) => {
    try {
      if (selectedPanel) {
        await updatePanel(selectedPanel.id, panelData)
        showResultModal("Панель обновлена", "Панель была успешно обновлена")
      } else {
        await createPanel(panelData)
        showResultModal("Панель добавлена", "Новая панель была успешно добавлена")
      }
    } catch (error) {
      showResultModal(
        "Ошибка сохранения",
        error instanceof Error ? error.message : "Не удалось сохранить панель",
        "error",
      )
    } finally {
      setIsAddPanelModalOpen(false)
      setIsEditPanelModalOpen(false)
      setSelectedPanel(null)
    }
  }

  const confirmDeletePanel = async () => {
    if (!selectedPanel) return

    try {
      await deletePanel(selectedPanel.id)
      showResultModal("Панель удалена", "Панель была успешно удалена")
    } catch (error) {
      showResultModal("Ошибка удаления", error instanceof Error ? error.message : "Не удалось удалить панель", "error")
    } finally {
      setIsDeletePanelModalOpen(false)
      setSelectedPanel(null)
    }
  }

  // Добавьте обработку ошибок
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

          {userRole === "admin" && (
            <Button onClick={handleAddPanel}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить панель
            </Button>
          )}

          {(userRole === "manager" || userRole === "admin") && (
            <Button onClick={generateReport}>
              <FileText className="mr-2 h-4 w-4" />
              Отчет
            </Button>
          )}

          <Button variant="outline" onClick={handleExportDashboard}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>

          {userRole === "admin" && (
            <Button variant="outline" onClick={() => router.push(`/dashboards/${dashboardUid}/settings`)}>
              <Settings className="mr-2 h-4 w-4" />
              Настройки
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="panels">Панели ({dashboard.panels.length})</TabsTrigger>
          {dashboard.templating?.list?.length > 0 && (
            <TabsTrigger value="variables">Переменные ({dashboard.templating.list.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboard.panels.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">В дашборде нет панелей</p>
              {userRole === "admin" && (
                <Button onClick={handleAddPanel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить первую панель
                </Button>
              )}
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
                        {userRole === "admin" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPanel(panel)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePanel(panel)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
            {userRole === "admin" && (
              <Button onClick={handleAddPanel}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить панель
              </Button>
            )}
          </div>

          {dashboard.panels.length === 0 ? (
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
                        Тип: {panel.type} | ID: {panel.id} | Позиция: {panel.gridPos.x},{panel.gridPos.y}
                      </p>
                    </div>
                    {userRole === "admin" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPanel(panel)}>
                          Редактировать
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePanel(panel)}>
                          Удалить
                        </Button>
                      </div>
                    )}
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

      {/* Модальное окно добавления панели */}
      <Modal
        title="Добавить панель"
        description="Создайте новую панель для отображения данных"
        isOpen={isAddPanelModalOpen}
        onClose={() => setIsAddPanelModalOpen(false)}
        className="max-w-4xl"
      >
        <PanelEditor panel={null} onSave={handleSavePanel} onCancel={() => setIsAddPanelModalOpen(false)} />
      </Modal>

      {/* Модальное окно редактирования панели */}
      <Modal
        title="Редактировать панель"
        description="Измените настройки панели"
        isOpen={isEditPanelModalOpen}
        onClose={() => setIsEditPanelModalOpen(false)}
        className="max-w-4xl"
      >
        <PanelEditor panel={selectedPanel} onSave={handleSavePanel} onCancel={() => setIsEditPanelModalOpen(false)} />
      </Modal>

      {/* Модальное окно подтверждения удаления панели */}
      <AlertModal
        isOpen={isDeletePanelModalOpen}
        onClose={() => setIsDeletePanelModalOpen(false)}
        onConfirm={confirmDeletePanel}
        title="Удалить панель"
        description={`Вы уверены, что хотите удалить панель "${selectedPanel?.title}"? Это действие нельзя будет отменить.`}
      />

      {/* Модальное окно результата операции */}
      <Modal
        title={resultModal.title}
        description={resultModal.description}
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
      >
        <div className="flex justify-end">
          <Button onClick={() => setIsResultModalOpen(false)}>ОК</Button>
        </div>
      </Modal>
    </div>
  )
}
