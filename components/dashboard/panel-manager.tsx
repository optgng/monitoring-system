"use client"
import { useState } from "react"
import { BarChart3, LineChart, PieChart, Table2, Gauge, Activity, Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { AlertModal } from "@/components/ui/alert-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"

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
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "",
    dataSource: "",
    size: "medium" as const,
  })

  const userRole = getCurrentUser().role
  const canEdit = (userRole === "admin" || userRole === "manager") && !readOnly

  // Handle adding a new panel
  const handleAddPanel = () => {
    const newPanel: PanelProps = {
      id: `panel-${Date.now()}`,
      title: editForm.title,
      description: editForm.description,
      type: editForm.type,
      dataSource: editForm.dataSource,
      size: editForm.size,
      position: { x: 0, y: 0 }, // Default position, would be adjusted in a real grid system
    }

    const updatedPanels = [...panels, newPanel]
    setPanels(updatedPanels)
    onPanelsChange?.(updatedPanels)
    setIsAddModalOpen(false)
    resetForm()
  }

  // Handle updating a panel
  const handleUpdatePanel = () => {
    if (!selectedPanel) return

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
  }

  // Handle deleting a panel
  const handleDeletePanel = () => {
    if (!selectedPanel) return

    const updatedPanels = panels.filter((panel) => panel.id !== selectedPanel.id)
    setPanels(updatedPanels)
    onPanelsChange?.(updatedPanels)
    setIsDeleteModalOpen(false)
    setSelectedPanel(null)
  }

  // Open edit modal with panel data
  const openEditModal = (panel: PanelProps) => {
    setSelectedPanel(panel)
    setEditForm({
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
        <div className="space-y-4 py-2 pb-4">
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
            <Label htmlFor="size">Размер панели</Label>
            <Select
              value={editForm.size}
              onValueChange={(value: "small" | "medium" | "large") => setEditForm({ ...editForm, size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите размер панели" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Маленький</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="large">Большой</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddPanel} disabled={!editForm.title || !editForm.type || !editForm.dataSource}>
              Добавить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Panel Modal */}
      <Modal
        title="Редактировать панель"
        description="Измените настройки панели"
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название</Label>
            <Input
              id="edit-title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea
              id="edit-description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
            <Label htmlFor="edit-size">Размер панели</Label>
            <Select
              value={editForm.size}
              onValueChange={(value: "small" | "medium" | "large") => setEditForm({ ...editForm, size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите размер панели" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Маленький</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="large">Большой</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdatePanel} disabled={!editForm.title || !editForm.type || !editForm.dataSource}>
              Сохранить
            </Button>
          </div>
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
