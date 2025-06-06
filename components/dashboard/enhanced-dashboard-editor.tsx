"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Save,
  ArrowLeft,
  Plus,
  Settings,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Grid,
  Clock,
  Globe,
  Shield,
  X,
  Tag,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { dashboardApi, Dashboard, Panel } from "@/lib/dashboard-api"
import { EnhancedPanelEditor } from "./enhanced-panel-editor"
import { DashboardImportExport } from "./dashboard-import-export"
import { getTagStyle } from "@/lib/tag-colors"
import { toast } from "sonner"

interface EnhancedDashboardEditorProps {
  uid?: string
  isCreating?: boolean
}

export function EnhancedDashboardEditor({ uid, isCreating = false }: EnhancedDashboardEditorProps) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(!isCreating)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Panel editor state
  const [isPanelEditorOpen, setIsPanelEditorOpen] = useState(false)
  const [editingPanel, setEditingPanel] = useState<Panel | undefined>()
  const [panelEditorMode, setPanelEditorMode] = useState<'create' | 'edit'>('create')

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    timezone: "browser",
    refresh: "30s",
    timeFrom: "now-1h",
    timeTo: "now",
    editable: true,
    graphTooltip: 0 // Добавляем graphTooltip в исходном состоянии
  })
  const [tagInput, setTagInput] = useState("")

  const router = useRouter()

  // Загрузка дашборда при редактировании
  useEffect(() => {
    if (!isCreating && uid) {
      loadDashboard()
    }
  }, [uid, isCreating])

  // Обновим функцию loadDashboard для обработки данных дашборда
  const loadDashboard = async () => {
    if (!uid) return

    setLoading(true)
    try {
      const response = await dashboardApi.getDashboard(uid)
      if (response.status === 'success' && response.data) {
        const dashboardData = response.data as Dashboard
        setDashboard(dashboardData)
        setFormData({
          title: dashboardData.title || "",
          description: dashboardData.description || "",
          tags: dashboardData.tags || [],
          timezone: dashboardData.timezone || "browser",
          refresh: dashboardData.refresh || "30s",
          timeFrom: dashboardData.time?.from || "now-1h",
          timeTo: dashboardData.time?.to || "now",
          editable: dashboardData.editable !== false,
          // Убедимся, что graphTooltip корректно инициализирован
          graphTooltip: dashboardData.graphTooltip || 0
        })
      } else {
        toast.error(response.message || 'Не удалось загрузить дашборд')
        router.push('/dashboards')
      }
    } catch (error) {
      console.error('Ошибка загрузки дашборда:', error)
      toast.error('Произошла ошибка при загрузке дашборда')
      router.push('/dashboards')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData({ tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Добавим функцию handleEditPanel, которая отсутствует
  const handleEditPanel = (panel: Panel) => {
    setEditingPanel(panel)
    setPanelEditorMode('edit')
    setIsPanelEditorOpen(true)
  }

  // Исправим функцию handleSave для корректной работы с API
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Название дашборда обязательно')
      return
    }

    setSaving(true)
    try {
      // Создаем структуру данных дашборда в соответствии с ожидаемым типом
      const dashboardData: Partial<Dashboard> = {
        title: formData.title,
        description: formData.description || "",
        tags: formData.tags || [],
        style: "dark", // Добавляем обязательные поля
        timezone: formData.timezone || "browser",
        editable: formData.editable !== false,
        hideControls: false,
        graphTooltip: formData.graphTooltip || 0,
        time: {
          from: formData.timeFrom || "now-6h",
          to: formData.timeTo || "now"
        },
        timepicker: {
          refresh_intervals: ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"],
          time_options: ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
        },
        templating: { list: [] },
        annotations: { list: [] },
        refresh: formData.refresh || "30s",
        schemaVersion: 36,
        version: dashboard?.version || 0,
        panels: dashboard?.panels || [],
        links: [],
        fiscalYearStartMonth: 0,
        liveNow: false,
        weekStart: ""
      };

      if (isCreating) {
        const response = await dashboardApi.createDashboard(dashboardData)
        if (response.status === 'success') {
          toast.success('Дашборд создан')
          router.push(`/dashboards/${response.data.uid}`)
        } else {
          toast.error(response.message || 'Ошибка создания дашборда')
        }
      } else if (uid) {
        const response = await dashboardApi.updateDashboard(uid, dashboardData)
        if (response.status === 'success') {
          toast.success('Дашборд обновлен')
          setDashboard(response.data)
        } else {
          toast.error(response.message || 'Ошибка обновления дашборда')
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      toast.error('Не удалось сохранить дашборд')
    } finally {
      setSaving(false)
    }
  }

  // Исправим функцию handleCreatePanel, чтобы она работала и для нового дашборда
  const handleCreatePanel = () => {
    // Для нового дашборда просто открываем модальное окно
    if (isCreating) {
      if (!formData.title.trim()) {
        toast.warning('Пожалуйста, укажите название дашборда перед добавлением панелей')
        return
      }

      // Открываем модальное окно для создания панели
      setEditingPanel(undefined)
      setPanelEditorMode('create')
      setIsPanelEditorOpen(true)
      return
    }

    // Для существующего дашборда
    setEditingPanel(undefined)
    setPanelEditorMode('create')
    setIsPanelEditorOpen(true)
  }

  // Обновим функцию handlePanelSave, чтобы она обрабатывала случай нового дашборда
  const handlePanelSave = (panel: Panel) => {
    if (isCreating) {
      // Для нового дашборда сохраняем панель в локальном состоянии
      const newDashboard: Dashboard = dashboard || {
        title: formData.title,
        panels: [],
        uid: 'temp'
      }

      const updatedPanels = [...(newDashboard.panels || []), panel]
      setDashboard({ ...newDashboard, panels: updatedPanels })
      toast.success(`Панель добавлена. Не забудьте сохранить дашборд.`)
    } else {
      // Для существующего дашборда
      if (dashboard) {
        const updatedPanels = panelEditorMode === 'create'
          ? [...(dashboard.panels || []), panel]
          : (dashboard.panels || []).map(p => p.id === panel.id ? panel : p)

        setDashboard(prev => prev ? { ...prev, panels: updatedPanels } : null)
        toast.success(`Панель ${panelEditorMode === 'create' ? 'создана' : 'обновлена'}`)
      }
    }
  }

  const handleDeletePanel = async (panelId: number) => {
    if (!uid) return

    try {
      const response = await dashboardApi.deletePanel(uid, panelId)
      if (response.status === 'success') {
        setDashboard(prev => prev ? {
          ...prev,
          panels: (prev.panels || []).filter(p => p.id !== panelId)
        } : null)
        toast.success('Панель удалена')
      } else {
        toast.error(response.message || 'Ошибка удаления панели')
      }
    } catch (error) {
      toast.error('Не удалось удалить панель')
    }
  }

  const handleImportSuccess = async (importedDashboard: Dashboard) => {
    // Обновляем данные формы из импортированного дашборда
    setFormData({
      title: importedDashboard.title || "",
      description: importedDashboard.description || "",
      tags: importedDashboard.tags || [],
      timezone: importedDashboard.timezone || "browser",
      refresh: importedDashboard.refresh || "30s",
      timeFrom: importedDashboard.time?.from || "now-1h",
      timeTo: importedDashboard.time?.to || "now",
      editable: importedDashboard.editable !== false,
      graphTooltip: importedDashboard.graphTooltip ?? 0
    })

    setDashboard(importedDashboard)
    toast.success('Дашборд импортирован')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Загрузка дашборда...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboards')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isCreating ? 'Создание дашборда' : 'Редактирование дашборда'}
            </h1>
            <p className="text-muted-foreground">
              {isCreating
                ? 'Создайте новый дашборд для мониторинга'
                : `Редактирование: ${formData.title || 'Без названия'}`
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isCreating && uid && (
            <>
              <DashboardImportExport
                dashboardUid={uid}
                onImportSuccess={handleImportSuccess}
                trigger={
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Импорт/Экспорт
                  </Button>
                }
              />
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboards/${uid}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Просмотр
              </Button>
            </>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Основные
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="h-4 w-4 mr-2" />
            Время
          </TabsTrigger>
          <TabsTrigger value="panels">
            <Grid className="h-4 w-4 mr-2" />
            Панели
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Shield className="h-4 w-4 mr-2" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Базовые настройки дашборда
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название дашборда *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Введите название дашборда"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select value={formData.timezone} onValueChange={(value) => updateFormData({ timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="browser">Браузер</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="Europe/Moscow">Москва</SelectItem>
                      <SelectItem value="Europe/London">Лондон</SelectItem>
                      <SelectItem value="America/New_York">Нью-Йорк</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Описание дашборда (необязательно)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Теги</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Добавить тег"
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        style={getTagStyle(tag)}
                        className="cursor-pointer"
                      >
                        {tag}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveTag(tag)}
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки времени</CardTitle>
              <CardDescription>
                Конфигурация временного диапазона и автообновления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Автообновление</Label>
                  <Select value={formData.refresh} onValueChange={(value) => updateFormData({ refresh: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Выключено</SelectItem>
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
                  <Label>От</Label>
                  <Select value={formData.timeFrom} onValueChange={(value) => updateFormData({ timeFrom: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                      <SelectItem value="now-7d">Последние 7 дней</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>До</Label>
                  <Select value={formData.timeTo} onValueChange={(value) => updateFormData({ timeTo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Сейчас</SelectItem>
                      {/* Заменяем пустое значение на конкретное значение */}
                      <SelectItem value="now-1m">1 минуту назад</SelectItem>
                      <SelectItem value="now-5m">5 минут назад</SelectItem>
                      <SelectItem value="now-15m">15 минут назад</SelectItem>
                      <SelectItem value="now-30m">30 минут назад</SelectItem>
                      <SelectItem value="now-1h">1 час назад</SelectItem>
                      <SelectItem value="now-3h">3 часа назад</SelectItem>
                      <SelectItem value="now-6h">6 часов назад</SelectItem>
                      <SelectItem value="now-12h">12 часов назад</SelectItem>
                      <SelectItem value="now-24h">24 часа назад</SelectItem>
                      <SelectItem value="now-2d">2 дня назад</SelectItem>
                      <SelectItem value="now-7d">7 дней назад</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="panels" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Панели дашборда</CardTitle>
                  <CardDescription>
                    Управление панелями и их настройками
                  </CardDescription>
                </div>
                <Button onClick={handleCreatePanel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить панель
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard?.panels && dashboard.panels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboard.panels.map((panel) => (
                    <Card key={panel.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base line-clamp-1">
                              {panel.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {panel.type} • {panel.gridPos.w}x{panel.gridPos.h}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditPanel(panel)}
                              className="h-7 w-7 p-0"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePanel(panel.id)}
                              className="h-7 w-7 p-0 text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground">
                          {panel.targets?.length || 0} запросов
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Grid className="h-8 w-8 mx-auto mb-2" />
                  <p>Панели не добавлены</p>
                  <p className="text-sm">Создайте первую панель для отображения данных</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Дополнительные настройки</CardTitle>
              <CardDescription>
                Расширенные параметры дашборда
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Редактируемый дашборд</Label>
                  <p className="text-sm text-muted-foreground">
                    Разрешить редактирование дашборда пользователями
                  </p>
                </div>
                <Switch
                  checked={formData.editable}
                  onCheckedChange={(checked) => updateFormData({ editable: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Подсказки графиков</Label>
                {/* Исправляем проблему с выбором значения */}
                <Select
                  value={formData.graphTooltip.toString()} // Приводим к строке
                  onValueChange={(value) => updateFormData({ graphTooltip: parseInt(value, 10) })}
                >
                  <SelectTrigger id="graphTooltip">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">По умолчанию</SelectItem>
                    <SelectItem value="1">Общие</SelectItem>
                    <SelectItem value="2">Раздельные</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Настройка поведения подсказок на графиках
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Panel Editor Modal - должен всегда рендериться */}
      <EnhancedPanelEditor
        dashboardUid={uid || 'new'} // Используем 'new' для нового дашборда
        panel={editingPanel}
        isOpen={isPanelEditorOpen}
        onClose={() => setIsPanelEditorOpen(false)}
        onSave={handlePanelSave}
        mode={panelEditorMode}
      />
    </div>
  )
}
