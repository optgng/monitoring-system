"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Settings, Plus, Edit, Trash2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/ui/alert-modal"
import { toast } from "@/components/ui/use-toast"

// Типы панелей
const PANEL_TYPES = [
  { id: "line", name: "Линейный график" },
  { id: "bar", name: "Столбчатый график" },
  { id: "pie", name: "Круговой график" },
  { id: "stat", name: "Статистика" },
]

// Источники данных
const DATA_SOURCES = [
  { id: "cpu", name: "Использование CPU" },
  { id: "memory", name: "Использование памяти" },
  { id: "disk", name: "Использование диска" },
  { id: "network", name: "Сетевой трафик" },
  { id: "requests", name: "Запросы в минуту" },
]

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardId = params.id
  const userRole = getCurrentUser().role

  // Состояния для модальных окон
  const [isAddPanelModalOpen, setIsAddPanelModalOpen] = useState(false)
  const [isEditPanelModalOpen, setIsEditPanelModalOpen] = useState(false)
  const [isDeletePanelModalOpen, setIsDeletePanelModalOpen] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState(null)

  // Состояния для форм
  const [newPanel, setNewPanel] = useState({
    title: "",
    description: "",
    type: "",
    dataSource: "",
  })

  const [editedPanel, setEditedPanel] = useState({
    title: "",
    description: "",
    type: "",
    dataSource: "",
  })

  // Имитация данных дашборда
  const dashboardData = {
    id: dashboardId,
    title: "Общий обзор системы",
    description: "Основные метрики всех систем",
    lastUpdated: "2 часа назад",
  }

  // Имитация данных панелей
  const [panels, setPanels] = useState([
    {
      id: "panel-1",
      title: "Нагрузка на системы",
      description: "Использование ресурсов за последние 24 часа",
      type: "line",
      dataSource: "cpu",
    },
    {
      id: "panel-2",
      title: "Статистика",
      description: "Общая информация о системе",
      type: "stat",
      dataSource: "servers",
    },
    {
      id: "panel-3",
      title: "Распределение ресурсов",
      description: "По типам сервисов",
      type: "pie",
      dataSource: "resources",
    },
    {
      id: "panel-4",
      title: "Активность системы",
      description: "Количество запросов в минуту",
      type: "bar",
      dataSource: "requests",
    },
  ])

  // Данные для графиков
  const performanceData = [
    { name: "00:00", cpu: 40, memory: 24, disk: 10 },
    { name: "04:00", cpu: 30, memory: 25, disk: 10 },
    { name: "08:00", cpu: 60, memory: 40, disk: 12 },
    { name: "12:00", cpu: 85, memory: 65, disk: 15 },
    { name: "16:00", cpu: 70, memory: 50, disk: 14 },
    { name: "20:00", cpu: 55, memory: 45, disk: 13 },
    { name: "Сейчас", cpu: 65, memory: 48, disk: 14 },
  ]

  const resourceData = [
    { name: "Web", value: 35 },
    { name: "DB", value: 25 },
    { name: "API", value: 20 },
    { name: "Cache", value: 15 },
    { name: "Other", value: 5 },
  ]

  const activityData = [
    { time: "00:00", requests: 120 },
    { time: "04:00", requests: 80 },
    { time: "08:00", requests: 250 },
    { time: "12:00", requests: 450 },
    { time: "16:00", requests: 380 },
    { time: "20:00", requests: 290 },
    { time: "Сейчас", requests: 320 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  const generateReport = () => {
    router.push(`/reports?dashboard=${dashboardId}`)
  }

  // Обработчики для панелей
  const handleAddPanel = () => {
    // Проверка заполнения всех полей
    if (!newPanel.title || !newPanel.description || !newPanel.type || !newPanel.dataSource) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      })
      return
    }

    // Добавление новой панели
    const newPanelWithId = {
      ...newPanel,
      id: `panel-${Date.now()}`,
    }

    setPanels([...panels, newPanelWithId])
    setIsAddPanelModalOpen(false)
    setNewPanel({
      title: "",
      description: "",
      type: "",
      dataSource: "",
    })

    toast({
      title: "Панель добавлена",
      description: `Панель "${newPanel.title}" была успешно добавлена`,
      variant: "default",
    })
  }

  const handleEditPanel = (panel) => {
    setSelectedPanel(panel)
    setEditedPanel({
      title: panel.title,
      description: panel.description,
      type: panel.type,
      dataSource: panel.dataSource,
    })
    setIsEditPanelModalOpen(true)
  }

  const handleUpdatePanel = () => {
    // Проверка заполнения всех полей
    if (!editedPanel.title || !editedPanel.description || !editedPanel.type || !editedPanel.dataSource) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      })
      return
    }

    // Обновление панели
    const updatedPanels = panels.map((panel) => (panel.id === selectedPanel.id ? { ...panel, ...editedPanel } : panel))

    setPanels(updatedPanels)
    setIsEditPanelModalOpen(false)

    toast({
      title: "Панель обновлена",
      description: `Панель "${editedPanel.title}" была успешно обновлена`,
      variant: "default",
    })
  }

  const handleDeletePanel = (panel) => {
    setSelectedPanel(panel)
    setIsDeletePanelModalOpen(true)
  }

  const confirmDeletePanel = () => {
    // Удаление панели
    const updatedPanels = panels.filter((panel) => panel.id !== selectedPanel.id)
    setPanels(updatedPanels)
    setIsDeletePanelModalOpen(false)

    toast({
      title: "Панель удалена",
      description: `Панель "${selectedPanel.title}" была успешно удалена`,
      variant: "default",
    })
  }

  // Рендеринг содержимого панели в зависимости от типа
  const renderPanelContent = (panel) => {
    switch (panel.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU (%)" />
              <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Память (%)" />
              <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Диск (%)" />
            </LineChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {resourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#ff7300" name="Запросы/мин" />
            </BarChart>
          </ResponsiveContainer>
        )
      case "stat":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Всего серверов</span>
                <span className="text-2xl font-bold">24</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Активных</span>
                <span className="text-2xl font-bold text-green-500">22</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Проблемных</span>
                <span className="text-2xl font-bold text-red-500">2</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Средняя нагрузка CPU</span>
                  <span>65%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Использование памяти</span>
                  <span>48%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: "48%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Использование диска</span>
                  <span>14%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: "14%" }} />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div>Неизвестный тип панели</div>
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dashboardData.title}</h1>
          <p className="text-muted-foreground">{dashboardData.description}</p>
        </div>
        <div className="flex gap-2">
          {userRole === "admin" && (
            <Button onClick={() => setIsAddPanelModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить панель
            </Button>
          )}
          {(userRole === "manager" || userRole === "admin") && (
            <Button onClick={generateReport}>
              <FileText className="mr-2 h-4 w-4" />
              Сформировать отчет
            </Button>
          )}
          {userRole === "admin" && (
            <Button variant="outline" onClick={() => router.push(`/dashboards/${dashboardId}/settings`)}>
              <Settings className="mr-2 h-4 w-4" />
              Настроить
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
          <TabsTrigger value="resources">Ресурсы</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {panels.map((panel) => (
              <Card
                key={panel.id}
                className={`${
                  panel.type === "line" ? "col-span-2" : panel.type === "stat" ? "col-span-1" : ""
                } overflow-hidden`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{panel.title}</CardTitle>
                      <CardDescription>{panel.description}</CardDescription>
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
                <CardContent className="pl-2">{renderPanelContent(panel)}</CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Содержимое вкладки производительности */}
          <Card>
            <CardHeader>
              <CardTitle>Детальная производительность</CardTitle>
              <CardDescription>Подробные метрики производительности системы</CardDescription>
            </CardHeader>
            <CardContent>{/* Здесь будут более детальные графики производительности */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {/* Содержимое вкладки ресурсов */}
          <Card>
            <CardHeader>
              <CardTitle>Использование ресурсов</CardTitle>
              <CardDescription>Детальная информация об использовании ресурсов</CardDescription>
            </CardHeader>
            <CardContent>{/* Здесь будут более детальные графики использования ресурсов */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальное окно добавления панели */}
      <Modal
        title="Добавить панель"
        description="Создайте новую панель для отображения данных"
        isOpen={isAddPanelModalOpen}
        onClose={() => setIsAddPanelModalOpen(false)}
      >
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="panel-title">Название</Label>
            <Input
              id="panel-title"
              placeholder="Введите название панели"
              value={newPanel.title}
              onChange={(e) => setNewPanel({ ...newPanel, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel-description">Описание</Label>
            <Textarea
              id="panel-description"
              placeholder="Введите описание панели"
              value={newPanel.description}
              onChange={(e) => setNewPanel({ ...newPanel, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel-type">Тип панели</Label>
            <Select value={newPanel.type} onValueChange={(value) => setNewPanel({ ...newPanel, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип панели" />
              </SelectTrigger>
              <SelectContent>
                {PANEL_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel-data-source">Источник данных</Label>
            <Select
              value={newPanel.dataSource}
              onValueChange={(value) => setNewPanel({ ...newPanel, dataSource: value })}
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
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsAddPanelModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddPanel}>Добавить</Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования панели */}
      {selectedPanel && (
        <Modal
          title="Редактировать панель"
          description="Измените настройки панели"
          isOpen={isEditPanelModalOpen}
          onClose={() => setIsEditPanelModalOpen(false)}
        >
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-panel-title">Название</Label>
              <Input
                id="edit-panel-title"
                value={editedPanel.title}
                onChange={(e) => setEditedPanel({ ...editedPanel, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-panel-description">Описание</Label>
              <Textarea
                id="edit-panel-description"
                value={editedPanel.description}
                onChange={(e) => setEditedPanel({ ...editedPanel, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-panel-type">Тип панели</Label>
              <Select
                value={editedPanel.type}
                onValueChange={(value) => setEditedPanel({ ...editedPanel, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип панели" />
                </SelectTrigger>
                <SelectContent>
                  {PANEL_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-panel-data-source">Источник данных</Label>
              <Select
                value={editedPanel.dataSource}
                onValueChange={(value) => setEditedPanel({ ...editedPanel, dataSource: value })}
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
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button variant="outline" onClick={() => setIsEditPanelModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdatePanel}>Сохранить</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модальное окно подтверждения удаления панели */}
      <AlertModal
        isOpen={isDeletePanelModalOpen}
        onClose={() => setIsDeletePanelModalOpen(false)}
        onConfirm={confirmDeletePanel}
        title="Удалить панель"
        description={`Вы уверены, что хотите удалить панель "${selectedPanel?.title}"? Это действие нельзя будет отменить.`}
      />
    </div>
  )
}
