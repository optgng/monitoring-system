"use client"
import { useState, useEffect } from "react"
import { BarChart3, LineChart, PieChart, Table2, Gauge, Activity, Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { AlertModal } from "@/components/ui/alert-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth"
import { useDashboard } from "@/hooks/use-dashboard"
import { toast } from "@/components/ui/use-toast"

// Panel types with their respective icons
const PANEL_TYPES = [
  { id: "line", name: "Линейный график", icon: LineChart },
  { id: "bar", name: "Столбчатый график", icon: BarChart3 },
  { id: "pie", name: "Круговой график", icon: PieChart },
  { id: "table", name: "Таблица", icon: Table2 },
  { id: "gauge", name: "Датчик", icon: Gauge },
  { id: "stat", name: "Статистика", icon: Activity },
]

// Sample data sources
const DATA_SOURCES = [
  { id: "cpu", name: "Использование CPU" },
  { id: "memory", name: "Использование памяти" },
  { id: "disk", name: "Использование диска" },
  { id: "network", name: "Сетевой трафик" },
  { id: "requests", name: "Запросы в минуту" },
]

export interface PanelProps {
  id: string
  title: string
  description?: string
  type: string
  dataSource: string
  size: "small" | "medium" | "large"
  position: { x: number; y: number }
  transparent?: boolean
  width?: number
  height?: number
  minInterval?: string
  relativeTime?: string
  timeShift?: string
  alias?: string
  colors?: string[]
  unit?: string
  legend?: {
    show: boolean
    position: "bottom" | "right" | "top"
    sortBy?: string
  }
  axes?: {
    left: { min?: number; max?: number; unit?: string; scale?: "linear" | "log" }
    right?: { min: number; max: number; unit?: string; scale?: "linear" | "log" }
  }
  thresholds?: Array<{ value: number; color: string; condition: "gt" | "lt" }>  // Обновлено: добавлен "lt"
  tooltip?: {
    mode: "single" | "multi" | "none"  // Обновлено: добавлены "multi" и "none"
    sort: "none" | "asc" | "desc"
  }
}

interface PanelManagerProps {
  dashboardId: string | number
  initialPanels?: PanelProps[]
  onPanelsChange?: (panels: PanelProps[]) => void
  readOnly?: boolean
}

export function PanelManager({ dashboardId, initialPanels = [], onPanelsChange, readOnly = false }: PanelManagerProps) {
  const [panels, setPanels] = useState<PanelProps[]>(initialPanels)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState<PanelProps | null>(null)
  type PanelSize = "small" | "medium" | "large";

  // Функция для определения ширины панели в зависимости от размера
  const getPanelWidth = (size: PanelSize): number => {
    switch (size) {
      case "small": return 12;
      case "large": return 24;
      case "medium":
      default: return 12;
    }
  };

  const [editForm, setEditForm] = useState({
    // Basic settings
    title: "",
    description: "",
    type: "",
    dataSource: "",
    size: "medium" as PanelSize,
    transparent: false,
    width: 12,
    height: 9,

    // Query settings
    alias: "",
    minInterval: "",
    relativeTime: "",
    timeShift: "",

    // Visualization settings
    colors: [],
    unit: "",
    legendShow: true,
    legendPosition: "bottom",
    legendSort: "none",

    // Axes settings
    leftAxisMin: "",
    leftAxisMax: "",
    leftAxisScale: "linear",
    rightAxisMin: "",
    rightAxisMax: "",
    rightAxisScale: "linear",

    // Thresholds
    thresholds: [{ value: 80, color: "#FF0000", condition: "gt" }],

    // Tooltip
    tooltipMode: "single",
    tooltipSort: "none",
  })
  const { createPanel, updatePanel, deletePanel } = useDashboard(dashboardId.toString())
  const [userRole, setUserRole] = useState<string>("user")
  const canEdit = (userRole === "admin" || userRole === "manager") && !readOnly

  // Получаем роль пользователя асинхронно
  useEffect(() => {
    async function loadUserRole() {
      const user = await getCurrentUser()
      setUserRole(user?.role || "user")
    }
    loadUserRole()
  }, [])

  // Handle adding a new panel
  const handleAddPanel = async () => {
    try {
      const newPanelData = {
        title: editForm.title,
        description: editForm.description,
        type: editForm.type,
        gridPos: { x: 0, y: 0, w: editForm.size === "small" ? 12 : editForm.size === "large" ? 24 : 12, h: 9 },
        targets: [],
      }

      await createPanel(newPanelData)

      const newPanel: PanelProps = {
        id: `panel-${Date.now()}`,
        title: editForm.title,
        description: editForm.description,
        type: editForm.type,
        dataSource: editForm.dataSource,
        size: editForm.size as "small" | "medium" | "large",
        position: { x: 0, y: 0 },
      }

      const updatedPanels = [...panels, newPanel]
      setPanels(updatedPanels)
      onPanelsChange?.(updatedPanels)
      setIsAddModalOpen(false)
      resetForm()

      toast({
        title: "Панель создана",
        description: "Панель успешно добавлена в дашборд",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать панель",
        variant: "destructive",
      })
      console.error("Failed to create panel:", error)
    }
  }

  // Handle updating a panel
  const handleUpdatePanel = async () => {
    if (!selectedPanel) return

    try {
      const updatedPanelData = {
        title: editForm.title,
        description: editForm.description,
        type: editForm.type,
        gridPos: { x: 0, y: 0, w: editForm.size === "small" ? 12 : editForm.size === "large" ? 24 : 12, h: 9 },
      }

      await updatePanel(parseInt(selectedPanel.id), updatedPanelData)

      const updatedPanels = panels.map((panel) =>
        panel.id === selectedPanel.id
          ? {
            ...panel,
            title: editForm.title,
            description: editForm.description,
            type: editForm.type,
            dataSource: editForm.dataSource,
            size: editForm.size,
          }
          : panel,
      )

      setPanels(updatedPanels)
      onPanelsChange?.(updatedPanels)
      setIsEditModalOpen(false)
      setSelectedPanel(null)
      resetForm()

      toast({
        title: "Панель обновлена",
        description: "Изменения панели успешно сохранены",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить панель",
        variant: "destructive",
      })
      console.error("Failed to update panel:", error)
    }
  }

  // Handle deleting a panel
  const handleDeletePanel = async () => {
    if (!selectedPanel) return

    try {
      await deletePanel(parseInt(selectedPanel.id))

      const updatedPanels = panels.filter((panel) => panel.id !== selectedPanel.id)
      setPanels(updatedPanels)
      onPanelsChange?.(updatedPanels)
      setIsDeleteModalOpen(false)
      setSelectedPanel(null)

      toast({
        title: "Панель удалена",
        description: "Панель успешно удалена из дашборда",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить панель",
        variant: "destructive",
      })
      console.error("Failed to delete panel:", error)
    }
  }
  // Open edit modal with panel data
  const openEditModal = (panel: PanelProps) => {
    setSelectedPanel(panel)
    setEditForm({
      ...editForm,
      title: panel.title,
      description: panel.description || "",
      type: panel.type,
      dataSource: panel.dataSource,
      size: panel.size,
    })
    setIsEditModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (panel: PanelProps) => {
    setSelectedPanel(panel)
    setIsDeleteModalOpen(true)
  }
  // Reset form state
  const resetForm = () => {
    setEditForm({
      ...editForm,
      title: "",
      description: "",
      type: "",
      dataSource: "",
      size: "medium",
    })
  }

  // Get panel icon by type
  const getPanelIcon = (type: string) => {
    const panelType = PANEL_TYPES.find((t) => t.id === type)
    return panelType?.icon || BarChart3
  }

  // Render panel content based on type
  const renderPanelContent = (panel: PanelProps) => {
    const PanelIcon = getPanelIcon(panel.type)

    // In a real application, this would render actual charts based on the panel type
    return (
      <div className="flex items-center justify-center h-full min-h-[150px] bg-muted/30 rounded-md">
        <PanelIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  // Get visualization-specific fields
  const getVisualizationFields = () => {
    switch (editForm.type) {
      case "line":
      case "bar":
        return (
          <>
            <div className="space-y-2">
              <Label>Оси</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Левая ось</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Мин"
                      value={editForm.leftAxisMin}
                      onChange={(e) => setEditForm({ ...editForm, leftAxisMin: e.target.value })}
                    />
                    <Input
                      placeholder="Макс"
                      value={editForm.leftAxisMax}
                      onChange={(e) => setEditForm({ ...editForm, leftAxisMax: e.target.value })}
                    />
                  </div>                  <Select
                    value={editForm.leftAxisScale}
                    onValueChange={(value) => setEditForm({ ...editForm, leftAxisScale: value as typeof editForm.leftAxisScale })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Линейная</SelectItem>
                      <SelectItem value="log">Логарифмическая</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Легенда</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editForm.legendShow}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, legendShow: checked })}
                  />
                  <Label>Показать легенду</Label>
                </div>
                {editForm.legendShow && (
                  <div className="grid grid-cols-2 gap-2">                    <Select
                    value={editForm.legendPosition}
                    onValueChange={(value) => setEditForm({ ...editForm, legendPosition: value as typeof editForm.legendPosition })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Снизу</SelectItem>
                      <SelectItem value="right">Справа</SelectItem>
                      <SelectItem value="top">Сверху</SelectItem>
                    </SelectContent>
                  </Select>
                    <Select
                      value={editForm.legendSort}
                      onValueChange={(value) => setEditForm({ ...editForm, legendSort: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Без сортировки</SelectItem>
                        <SelectItem value="asc">По возрастанию</SelectItem>
                        <SelectItem value="desc">По убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </>
        )

      case "gauge":
        return (
          <div className="space-y-2">
            <Label>Пороги</Label>
            <div className="space-y-2">
              {editForm.thresholds.map((threshold, index) => (
                <div key={index} className="grid grid-cols-4 gap-2">
                  <Input
                    type="number"
                    placeholder="Значение"
                    value={threshold.value}
                    onChange={(e) => {
                      const newThresholds = [...editForm.thresholds]
                      newThresholds[index].value = Number(e.target.value)
                      setEditForm({ ...editForm, thresholds: newThresholds })
                    }}
                  />
                  <Input
                    placeholder="Цвет"
                    value={threshold.color}
                    onChange={(e) => {
                      const newThresholds = [...editForm.thresholds]
                      newThresholds[index].color = e.target.value
                      setEditForm({ ...editForm, thresholds: newThresholds })
                    }}
                  />
                  <Select
                    value={threshold.condition} onValueChange={(value) => {
                      const newThresholds = [...editForm.thresholds]
                      newThresholds[index].condition = value as "gt" | "lt"; // Исправлено: добавлено явное приведение типа
                      setEditForm({ ...editForm, thresholds: newThresholds })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Больше</SelectItem>
                      <SelectItem value="lt">Меньше</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newThresholds = editForm.thresholds.filter((_, i) => i !== index)
                      setEditForm({ ...editForm, thresholds: newThresholds })
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    ...editForm,
                    thresholds: [...editForm.thresholds, { value: 0, color: "#FF0000", condition: "gt" }]
                  })
                }}
              >
                Добавить порог
              </Button>
            </div>
          </div>
        )

      case "table":
        return (
          <div className="space-y-2">
            <Label>Настройки таблицы</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={Boolean(editForm.tooltipMode !== "none")} // Исправлено: добавлено приведение к Boolean
                  onCheckedChange={(checked) => setEditForm({ ...editForm, tooltipMode: checked ? "single" : "none" as "single" | "none" })} // Исправлено: явное приведение типа
                />
                <Label>Показать подсказки</Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить панель
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {panels.map((panel) => {
          // Determine column span based on panel size
          const colSpan =
            panel.size === "small"
              ? "col-span-1"
              : panel.size === "large"
                ? "col-span-3 md:col-span-3"
                : "col-span-1 md:col-span-2"

          return (
            <Card key={panel.id} className={`${colSpan} overflow-hidden`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{panel.title}</CardTitle>
                    {panel.description && <p className="text-sm text-muted-foreground">{panel.description}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(panel)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteModal(panel)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>{renderPanelContent(panel)}</CardContent>
              <CardFooter className="bg-muted/20 py-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>
                    Источник: {DATA_SOURCES.find((ds) => ds.id === panel.dataSource)?.name || panel.dataSource}
                  </span>
                </div>
              </CardFooter>
            </Card>
          )
        })}

        {panels.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Нет доступных панелей</p>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsAddModalOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить первую панель
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Panel Modal */}
      <Modal
        title="Добавить панель"
        description="Создайте новую панель для отображения данных"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Основные</TabsTrigger>
            <TabsTrigger value="queries">Запросы</TabsTrigger>
            <TabsTrigger value="visualization">Визуализация</TabsTrigger>
            <TabsTrigger value="display">Отображение</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Введите название панели"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Введите описание панели"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип панели</Label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип панели" />
                </SelectTrigger>
                <SelectContent>
                  {PANEL_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        <type.icon className="mr-2 h-4 w-4" />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Размер и позиция</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm">Ширина</Label>
                  <Input
                    type="number"
                    value={editForm.width}
                    onChange={(e) => setEditForm({ ...editForm, width: Number(e.target.value) })}
                    min="1"
                    max="24"
                  />
                </div>
                <div>
                  <Label className="text-sm">Высота</Label>
                  <Input
                    type="number"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="flex items-center justify-center pt-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.transparent}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, transparent: checked })}
                    />
                    <Label className="text-sm">Прозрачный</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataSource">Источник данных</Label>
              <Select
                value={editForm.dataSource}
                onValueChange={(value) => setEditForm({ ...editForm, dataSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите источник данных" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">Псевдоним для легенды</Label>
              <Input
                id="alias"
                value={editForm.alias}
                onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                placeholder="Введите псевдоним"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-base font-medium">Параметры запроса</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minInterval">Мин. интервал</Label>
                  <Select
                    value={editForm.minInterval}
                    onValueChange={(value) => setEditForm({ ...editForm, minInterval: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Авто" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Авто</SelectItem>
                      <SelectItem value="1s">1 секунда</SelectItem>
                      <SelectItem value="5s">5 секунд</SelectItem>
                      <SelectItem value="10s">10 секунд</SelectItem>
                      <SelectItem value="30s">30 секунд</SelectItem>
                      <SelectItem value="1m">1 минута</SelectItem>
                      <SelectItem value="5m">5 минут</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relativeTime">Относительное время</Label>
                  <Input
                    id="relativeTime"
                    value={editForm.relativeTime}
                    onChange={(e) => setEditForm({ ...editForm, relativeTime: e.target.value })}
                    placeholder="Например: -1h"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeShift">Сдвиг времени</Label>
                  <Input
                    id="timeShift"
                    value={editForm.timeShift}
                    onChange={(e) => setEditForm({ ...editForm, timeShift: e.target.value })}
                    placeholder="Например: 1d"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Единица измерения</Label>
              <Select
                value={editForm.unit}
                onValueChange={(value) => setEditForm({ ...editForm, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без единицы</SelectItem>
                  <SelectItem value="percent">Проценты (%)</SelectItem>
                  <SelectItem value="bytes">Байты (B)</SelectItem>
                  <SelectItem value="bits">Биты (bit)</SelectItem>
                  <SelectItem value="seconds">Секунды (s)</SelectItem>
                  <SelectItem value="milliseconds">Миллисекунды (ms)</SelectItem>
                  <SelectItem value="requests">Запросы/сек</SelectItem>
                  <SelectItem value="ops">Операции/сек</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {getVisualizationFields()}
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Подсказки (Tooltip)</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Режим</Label>
                  <Select
                    value={editForm.tooltipMode}
                    onValueChange={(value) => setEditForm({ ...editForm, tooltipMode: value as "single" | "multi" | "none" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Одно значение</SelectItem>
                      <SelectItem value="multi">Все значения</SelectItem>
                      <SelectItem value="none">Отключено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Сортировка</Label>
                  <Select
                    value={editForm.tooltipSort}
                    onValueChange={(value) => setEditForm({ ...editForm, tooltipSort: value as "none" | "asc" | "desc" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без сортировки</SelectItem>
                      <SelectItem value="asc">По возрастанию</SelectItem>
                      <SelectItem value="desc">По убыванию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleAddPanel} disabled={!editForm.title || !editForm.type || !editForm.dataSource}>
            Добавить
          </Button>
        </div>
      </Modal>

      {/* Edit Panel Modal */}
      <Modal
        title="Редактировать панель"
        description="Измените настройки панели"
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Основные</TabsTrigger>
            <TabsTrigger value="queries">Запросы</TabsTrigger>
            <TabsTrigger value="visualization">Визуализация</TabsTrigger>
            <TabsTrigger value="display">Отображение</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Введите название панели"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Введите описание панели"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Тип панели</Label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип панели" />
                </SelectTrigger>
                <SelectContent>
                  {PANEL_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        <type.icon className="mr-2 h-4 w-4" />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Размер и позиция</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm">Ширина</Label>
                  <Input
                    type="number"
                    value={editForm.width}
                    onChange={(e) => setEditForm({ ...editForm, width: Number(e.target.value) })}
                    min="1"
                    max="24"
                  />
                </div>
                <div>
                  <Label className="text-sm">Высота</Label>
                  <Input
                    type="number"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="flex items-center justify-center pt-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.transparent}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, transparent: checked })}
                    />
                    <Label className="text-sm">Прозрачный</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dataSource">Источник данных</Label>
              <Select
                value={editForm.dataSource}
                onValueChange={(value) => setEditForm({ ...editForm, dataSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите источник данных" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-alias">Псевдоним для легенды</Label>
              <Input
                id="edit-alias"
                value={editForm.alias}
                onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                placeholder="Введите псевдоним"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-base font-medium">Параметры запроса</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-minInterval">Мин. интервал</Label>
                  <Select
                    value={editForm.minInterval}
                    onValueChange={(value) => setEditForm({ ...editForm, minInterval: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Авто" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Авто</SelectItem>
                      <SelectItem value="1s">1 секунда</SelectItem>
                      <SelectItem value="5s">5 секунд</SelectItem>
                      <SelectItem value="10s">10 секунд</SelectItem>
                      <SelectItem value="30s">30 секунд</SelectItem>
                      <SelectItem value="1m">1 минута</SelectItem>
                      <SelectItem value="5m">5 минут</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-relativeTime">Относительное время</Label>
                  <Input
                    id="edit-relativeTime"
                    value={editForm.relativeTime}
                    onChange={(e) => setEditForm({ ...editForm, relativeTime: e.target.value })}
                    placeholder="Например: -1h"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-timeShift">Сдвиг времени</Label>
                  <Input
                    id="edit-timeShift"
                    value={editForm.timeShift}
                    onChange={(e) => setEditForm({ ...editForm, timeShift: e.target.value })}
                    placeholder="Например: 1d"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Единица измерения</Label>
              <Select
                value={editForm.unit}
                onValueChange={(value) => setEditForm({ ...editForm, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без единицы</SelectItem>
                  <SelectItem value="percent">Проценты (%)</SelectItem>
                  <SelectItem value="bytes">Байты (B)</SelectItem>
                  <SelectItem value="bits">Биты (bit)</SelectItem>
                  <SelectItem value="seconds">Секунды (s)</SelectItem>
                  <SelectItem value="milliseconds">Миллисекунды (ms)</SelectItem>
                  <SelectItem value="requests">Запросы/сек</SelectItem>
                  <SelectItem value="ops">Операции/сек</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {getVisualizationFields()}
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Подсказки (Tooltip)</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Режим</Label>
                  <Select
                    value={editForm.tooltipMode}
                    onValueChange={(value) => setEditForm({ ...editForm, tooltipMode: value as "single" | "multi" | "none" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Одно значение</SelectItem>
                      <SelectItem value="multi">Все значения</SelectItem>
                      <SelectItem value="none">Отключено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Сортировка</Label>
                  <Select
                    value={editForm.tooltipSort}
                    onValueChange={(value) => setEditForm({ ...editForm, tooltipSort: value as "none" | "asc" | "desc" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без сортировки</SelectItem>
                      <SelectItem value="asc">По возрастанию</SelectItem>
                      <SelectItem value="desc">По убыванию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleUpdatePanel} disabled={!editForm.title || !editForm.type || !editForm.dataSource}>
            Сохранить
          </Button>
        </div>
      </Modal>

      {/* Delete Panel Confirmation */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePanel}
        title="Удалить панель"
        description={`Вы уверены, что хотите удалить панель "${selectedPanel?.title}"? Это действие нельзя будет отменить.`}
      />
    </div>
  )
}
