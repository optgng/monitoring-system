"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Plus, ArrowLeft, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PanelEditor } from "./panel-editor"
import { Modal } from "@/components/ui/modal"
import { VariableEditor } from "./variable-editor"
import { AnnotationEditor } from "./annotation-editor"
import { dashboardApi, type Dashboard, type Panel } from "@/lib/dashboard-api"

interface DashboardEditorProps {
  dashboardUid?: string
  initialData?: Dashboard
  isCreating?: boolean
}

export function DashboardEditor({ dashboardUid, initialData, isCreating = false }: DashboardEditorProps) {
  const [dashboard, setDashboard] = useState<Dashboard>(
    initialData || {
      uid: "",
      title: "",
      description: "",
      tags: [],
      timezone: "browser",
      refresh: "5m",
      time: {
        from: "now-1h",
        to: "now",
      },
      templating: {
        list: [],
      },
      annotations: {
        list: [],
      },
      panels: [],
      editable: true,
      style: "dark",
    },
  )

  const [loading, setLoading] = useState(false)
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false)
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false)
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null)
  const [editingVariable, setEditingVariable] = useState(null)
  const [editingAnnotation, setEditingAnnotation] = useState(null)
  const [importJson, setImportJson] = useState("")
  const router = useRouter()

  const showResultModal = (title: string, description: string, type: "success" | "error" = "success") => {
    setResultModal({ title, description, type })
    setIsResultModalOpen(true)
  }

  // Handle dashboard field changes
  const handleDashboardChange = (field: string, value: any) => {
    setDashboard((prev) => ({ ...prev, [field]: value }))
  }

  // Handle nested field changes
  const handleNestedChange = (path: string[], value: any) => {
    setDashboard((prev) => {
      const newDashboard = { ...prev }
      let current = newDashboard
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {}
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newDashboard
    })
  }

  // Save dashboard
  const handleSave = async () => {
    if (!dashboard.title || !dashboard.description) {
      showResultModal("Ошибка", "Пожалуйста, заполните название и описание дашборда", "error")
      return
    }

    setLoading(true)
    try {
      let response
      if (isCreating) {
        response = await dashboardApi.createDashboard(dashboard)
      } else if (dashboardUid) {
        response = await dashboardApi.updateDashboard(dashboardUid, dashboard)
      }

      if (response?.status === "success") {
        showResultModal(
          isCreating ? "Дашборд создан" : "Дашборд сохранен",
          isCreating ? "Дашборд был успешно создан" : "Все изменения успешно сохранены",
        )

        if (isCreating && response.data.uid) {
          // Redirect to the new dashboard
          setTimeout(() => {
            router.push(`/dashboards/${response.data.uid}`)
          }, 1500)
        }
      } else {
        showResultModal("Ошибка сохранения", response?.message || "Не удалось сохранить дашборд", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при сохранении дашборда", "error")
    } finally {
      setLoading(false)
    }
  }

  // Panel management
  const handleAddPanel = () => {
    setEditingPanel(null)
    setIsPanelModalOpen(true)
  }

  const handleEditPanel = (panel: Panel) => {
    setEditingPanel(panel)
    setIsPanelModalOpen(true)
  }

  const handleSavePanel = async (panelData: Partial<Panel>) => {
    if (isCreating) {
      // For new dashboards, just add to local state
      if (editingPanel) {
        setDashboard((prev) => ({
          ...prev,
          panels: prev.panels.map((p) =>
            p.id === editingPanel.id ? ({ ...panelData, id: editingPanel.id } as Panel) : p,
          ),
        }))
        showResultModal("Панель обновлена", "Панель была успешно обновлена")
      } else {
        const newPanel: Panel = {
          ...panelData,
          id: Date.now(),
          gridPos: {
            h: 8,
            w: 12,
            x: 0,
            y: dashboard.panels.length * 8,
          },
        } as Panel
        setDashboard((prev) => ({
          ...prev,
          panels: [...prev.panels, newPanel],
        }))
        showResultModal("Панель добавлена", "Новая панель была успешно добавлена")
      }
      setIsPanelModalOpen(false)
    } else if (dashboardUid) {
      // For existing dashboards, use API
      try {
        if (editingPanel) {
          const response = await dashboardApi.updatePanel(dashboardUid, editingPanel.id, panelData)
          if (response.status === "success") {
            setDashboard((prev) => ({
              ...prev,
              panels: prev.panels.map((p) => (p.id === editingPanel.id ? response.data : p)),
            }))
            showResultModal("Панель обновлена", "Панель была успешно обновлена")
          } else {
            showResultModal("Ошибка обновления", response.message || "Не удалось обновить панель", "error")
          }
        } else {
          const response = await dashboardApi.createPanel(dashboardUid, panelData)
          if (response.status === "success") {
            setDashboard((prev) => ({
              ...prev,
              panels: [...prev.panels, response.data],
            }))
            showResultModal("Панель добавлена", "Новая панель была успешно добавлена")
          } else {
            showResultModal("Ошибка создания", response.message || "Не удалось создать панель", "error")
          }
        }
        setIsPanelModalOpen(false)
      } catch (error) {
        showResultModal("Ошибка", "Произошла ошибка при сохранении панели", "error")
      }
    }
  }

  const handleDeletePanel = async (panelId: number) => {
    if (isCreating) {
      setDashboard((prev) => ({
        ...prev,
        panels: prev.panels.filter((p) => p.id !== panelId),
      }))
      showResultModal("Панель удалена", "Панель была успешно удалена")
    } else if (dashboardUid) {
      try {
        const response = await dashboardApi.deletePanel(dashboardUid, panelId)
        if (response.status === "success") {
          setDashboard((prev) => ({
            ...prev,
            panels: prev.panels.filter((p) => p.id !== panelId),
          }))
          showResultModal("Панель удалена", "Панель была успешно удалена")
        } else {
          showResultModal("Ошибка удаления", response.message || "Не удалось удалить панель", "error")
        }
      } catch (error) {
        showResultModal("Ошибка", "Произошла ошибка при удалении панели", "error")
      }
    }
  }

  // Export dashboard
  const handleExport = async () => {
    if (dashboardUid) {
      try {
        const response = await dashboardApi.exportDashboard(dashboardUid)
        if (response.status === "success") {
          const dataStr = response.data
          const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
          const exportFileDefaultName = `dashboard-${dashboard.title || "untitled"}.json`

          const linkElement = document.createElement("a")
          linkElement.setAttribute("href", dataUri)
          linkElement.setAttribute("download", exportFileDefaultName)
          linkElement.click()

          showResultModal("Дашборд экспортирован", "Конфигурация дашборда была успешно экспортирована")
        } else {
          showResultModal("Ошибка экспорта", response.message || "Не удалось экспортировать дашборд", "error")
        }
      } catch (error) {
        showResultModal("Ошибка", "Произошла ошибка при экспорте дашборда", "error")
      }
    } else {
      // For new dashboards, export current state
      const dataStr = JSON.stringify(dashboard, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
      const exportFileDefaultName = `dashboard-${dashboard.title || "untitled"}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      showResultModal("Дашборд экспортирован", "Конфигурация дашборда была успешно экспортирована")
    }
  }

  // Import dashboard
  const handleImport = async () => {
    try {
      if (isCreating) {
        const importedDashboard = JSON.parse(importJson)
        setDashboard(importedDashboard)
        setIsImportModalOpen(false)
        setImportJson("")
        showResultModal("Дашборд импортирован", "Конфигурация дашборда была успешно импортирована")
      } else {
        const response = await dashboardApi.importDashboard(importJson)
        if (response.status === "success") {
          setDashboard(response.data)
          setIsImportModalOpen(false)
          setImportJson("")
          showResultModal("Дашборд импортирован", "Конфигурация дашборда была успешно импортирована")
        } else {
          showResultModal("Ошибка импорта", response.message || "Не удалось импортировать дашборд", "error")
        }
      }
    } catch (error) {
      showResultModal("Ошибка импорта", "Неверный формат JSON", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isCreating ? "Создание дашборда" : "Редактирование дашборда"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Импорт JSON
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие настройки</TabsTrigger>
          <TabsTrigger value="panels">Панели</TabsTrigger>
          <TabsTrigger value="data">Управление данными</TabsTrigger>
          <TabsTrigger value="access">Контроль доступа</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Настройте основные параметры дашборда</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название дашборда</Label>
                  <Input
                    id="title"
                    value={dashboard.title}
                    onChange={(e) => handleDashboardChange("title", e.target.value)}
                    placeholder="Введите название дашборда"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uid">UID дашборда</Label>
                  <Input
                    id="uid"
                    value={dashboard.uid}
                    onChange={(e) => handleDashboardChange("uid", e.target.value)}
                    placeholder="Уникальный идентификатор"
                    disabled={!isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={dashboard.description}
                  onChange={(e) => handleDashboardChange("description", e.target.value)}
                  placeholder="Введите описание дашборда"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refresh">Интервал обновления</Label>
                  <Select value={dashboard.refresh} onValueChange={(value) => handleDashboardChange("refresh", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите интервал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5s">5 секунд</SelectItem>
                      <SelectItem value="10s">10 секунд</SelectItem>
                      <SelectItem value="30s">30 секунд</SelectItem>
                      <SelectItem value="1m">1 минута</SelectItem>
                      <SelectItem value="5m">5 минут</SelectItem>
                      <SelectItem value="15m">15 минут</SelectItem>
                      <SelectItem value="30m">30 минут</SelectItem>
                      <SelectItem value="1h">1 час</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select
                    value={dashboard.timezone}
                    onValueChange={(value) => handleDashboardChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите часовой пояс" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="browser">Браузер</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="Europe/Moscow">Москва</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Тема</Label>
                  <Select value={dashboard.style} onValueChange={(value) => handleDashboardChange("style", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Темная</SelectItem>
                      <SelectItem value="light">Светлая</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time-from">Временной диапазон (от)</Label>
                  <Select
                    value={dashboard.time?.from}
                    onValueChange={(value) => handleNestedChange(["time", "from"], value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите начало" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now-5m">Последние 5 минут</SelectItem>
                      <SelectItem value="now-15m">Последние 15 минут</SelectItem>
                      <SelectItem value="now-30m">Последние 30 минут</SelectItem>
                      <SelectItem value="now-1h">Последний час</SelectItem>
                      <SelectItem value="now-3h">Последние 3 часа</SelectItem>
                      <SelectItem value="now-6h">Последние 6 часов</SelectItem>
                      <SelectItem value="now-12h">Последние 12 часов</SelectItem>
                      <SelectItem value="now-24h">Последние 24 часа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-to">Временной диапазон (до)</Label>
                  <Select
                    value={dashboard.time?.to}
                    onValueChange={(value) => handleNestedChange(["time", "to"], value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите конец" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Сейчас</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editable"
                  checked={dashboard.editable}
                  onCheckedChange={(checked) => handleDashboardChange("editable", checked)}
                />
                <Label htmlFor="editable">Разрешить редактирование</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="panels">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Панели дашборда</CardTitle>
                  <CardDescription>Управление панелями и их настройками</CardDescription>
                </div>
                <Button onClick={handleAddPanel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить панель
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard.panels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Панели не добавлены</p>
                  <p className="text-sm">Нажмите "Добавить панель" для создания первой панели</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.panels.map((panel) => (
                    <Card key={panel.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{panel.title || "Без названия"}</h4>
                          <p className="text-sm text-muted-foreground">Тип: {panel.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPanel(panel)}>
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeletePanel(panel.id)}>
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Управление данными</CardTitle>
              <CardDescription>Настройки источников данных и переменных</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Переменные дашборда</Label>
                    <p className="text-sm text-muted-foreground">
                      Переменные позволяют создавать интерактивные и переиспользуемые дашборды
                    </p>
                  </div>
                  <Button onClick={() => setIsVariableModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить переменную
                  </Button>
                </div>

                {dashboard.templating?.list?.length > 0 && (
                  <div className="space-y-2">
                    {dashboard.templating.list.map((variable) => (
                      <Card key={variable.name} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{variable.name}</h4>
                            <p className="text-sm text-muted-foreground">Тип: {variable.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingVariable(variable)}>
                              Редактировать
                            </Button>
                            <Button variant="outline" size="sm">
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Аннотации</Label>
                    <p className="text-sm text-muted-foreground">
                      Аннотации отображают события на графиках в виде вертикальных линий
                    </p>
                  </div>
                  <Button onClick={() => setIsAnnotationModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить аннотацию
                  </Button>
                </div>

                {dashboard.annotations?.list?.length > 0 && (
                  <div className="space-y-2">
                    {dashboard.annotations.list.map((annotation) => (
                      <Card key={annotation.name} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{annotation.name}</h4>
                            <p className="text-sm text-muted-foreground">Источник: {annotation.datasource}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingAnnotation(annotation)}>
                              Редактировать
                            </Button>
                            <Button variant="outline" size="sm">
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Контроль доступа</CardTitle>
              <CardDescription>Настройки доступа к дашборду</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Роли с доступом</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="role-admin" checked={true} disabled />
                    <Label htmlFor="role-admin">Администраторы</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="role-manager" checked={true} />
                    <Label htmlFor="role-manager">Менеджеры</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="role-support" checked={true} />
                    <Label htmlFor="role-support">Специалисты технической поддержки</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Дополнительные настройки</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="allow-editing" checked={dashboard.editable} />
                  <Label htmlFor="allow-editing">Разрешить редактирование другим пользователям</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Panel Editor Modal */}
      <Modal
        title={editingPanel ? "Редактировать панель" : "Добавить панель"}
        description="Настройте параметры панели и запросы данных"
        isOpen={isPanelModalOpen}
        onClose={() => setIsPanelModalOpen(false)}
        className="max-w-4xl"
      >
        <PanelEditor panel={editingPanel} onSave={handleSavePanel} onCancel={() => setIsPanelModalOpen(false)} />
      </Modal>

      {/* Variable Editor Modal */}
      <Modal
        title={editingVariable ? "Редактировать переменную" : "Добавить переменную"}
        description="Настройте параметры переменной дашборда"
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
        className="max-w-2xl"
      >
        <VariableEditor
          variable={editingVariable}
          onSave={() => setIsVariableModalOpen(false)}
          onCancel={() => setIsVariableModalOpen(false)}
        />
      </Modal>

      {/* Annotation Editor Modal */}
      <Modal
        title={editingAnnotation ? "Редактировать аннотацию" : "Добавить аннотацию"}
        description="Настройте параметры аннотации"
        isOpen={isAnnotationModalOpen}
        onClose={() => setIsAnnotationModalOpen(false)}
        className="max-w-2xl"
      >
        <AnnotationEditor
          annotation={editingAnnotation}
          onSave={() => setIsAnnotationModalOpen(false)}
          onCancel={() => setIsAnnotationModalOpen(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Импорт конфигурации дашборда"
        description="Вставьте JSON конфигурацию дашборда"
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-json">JSON конфигурация</Label>
            <Textarea
              id="import-json"
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Вставьте JSON конфигурацию дашборда..."
              rows={10}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleImport}>Импортировать</Button>
          </div>
        </div>
      </Modal>

      {/* Result Modal */}
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
