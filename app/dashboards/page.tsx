"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, BarChart3, LineChart, PieChart, Table2, Trash2, FileText, Search } from "lucide-react"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/ui/alert-modal"
import { getCurrentUser } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export default function DashboardsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newDashboard, setNewDashboard] = useState({
    title: "",
    description: "",
    type: "custom",
  })
  const [editedDashboard, setEditedDashboard] = useState({
    title: "",
    description: "",
    type: "custom",
  })
  const router = useRouter()
  const userRole = getCurrentUser().role

  const dashboards = [
    {
      id: 1,
      title: "Общий обзор системы",
      description: "Основные метрики всех систем",
      widgets: 8,
      lastUpdated: "2 часа назад",
      icon: BarChart3,
      type: "system",
    },
    {
      id: 2,
      title: "Производительность серверов",
      description: "Детальный мониторинг производительности",
      widgets: 6,
      lastUpdated: "1 день назад",
      icon: LineChart,
      type: "system",
    },
    {
      id: 3,
      title: "Сетевая активность",
      description: "Мониторинг сетевого трафика",
      widgets: 5,
      lastUpdated: "3 часа назад",
      icon: LineChart,
      type: "network",
    },
    {
      id: 4,
      title: "Использование ресурсов",
      description: "Распределение ресурсов по сервисам",
      widgets: 4,
      lastUpdated: "5 часов назад",
      icon: PieChart,
      type: "system",
    },
    {
      id: 5,
      title: "Логи и ошибки",
      description: "Анализ логов и ошибок системы",
      widgets: 3,
      lastUpdated: "1 час назад",
      icon: Table2,
      type: "custom",
    },
  ]

  // Filter dashboards based on search query and selected tab
  const filterDashboards = (dashboards, query, tab) => {
    return dashboards.filter((dashboard) => {
      const matchesQuery =
        !query ||
        dashboard.title.toLowerCase().includes(query.toLowerCase()) ||
        dashboard.description.toLowerCase().includes(query.toLowerCase())

      const matchesTab = tab === "all" || dashboard.type === tab

      return matchesQuery && matchesTab
    })
  }

  const handleEdit = (dashboard: any) => {
    setSelectedDashboard(dashboard)
    setEditedDashboard({
      title: dashboard.title,
      description: dashboard.description,
      type: dashboard.type,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (dashboard: any) => {
    setSelectedDashboard(dashboard)
    setIsDeleteModalOpen(true)
  }

  const onDelete = () => {
    // В реальном приложении здесь был бы API-запрос на удаление
    toast({
      title: "Дашборд удален",
      description: `Дашборд "${selectedDashboard.title}" был успешно удален`,
      variant: "default",
    })
    setIsDeleteModalOpen(false)
  }

  const generateReport = (dashboardId: number) => {
    router.push(`/reports?dashboard=${dashboardId}`)
  }

  const handleCreateDashboard = () => {
    // Проверка заполнения всех полей
    if (!newDashboard.title || !newDashboard.description || !newDashboard.type) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      })
      return
    }

    // В реальном приложении здесь был бы API-запрос на создание
    toast({
      title: "Дашборд создан",
      description: `Дашборд "${newDashboard.title}" был успешно создан`,
      variant: "default",
    })
    setIsCreateModalOpen(false)
    setNewDashboard({
      title: "",
      description: "",
      type: "custom",
    })
    // Перенаправление на новый дашборд (в реальном приложении был бы ID нового дашборда)
    router.push(`/dashboards/6`)
  }

  const handleUpdateDashboard = () => {
    // Проверка заполнения всех полей
    if (!editedDashboard.title || !editedDashboard.description || !editedDashboard.type) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      })
      return
    }

    // В реальном приложении здесь был бы API-запрос на обновление
    toast({
      title: "Дашборд обновлен",
      description: `Дашборд "${editedDashboard.title}" был успешно обновлен`,
      variant: "default",
    })
    setIsEditModalOpen(false)
  }

  const handleDuplicateDashboard = (dashboard) => {
    // В реальном приложении здесь был бы API-запрос на дублирование
    toast({
      title: "Дашборд дублирован",
      description: `Копия дашборда "${dashboard.title}" была успешно создана`,
      variant: "default",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Дашборды</h1>
        {userRole && userRole === "admin" && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Создать дашборд
          </Button>
        )}
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Поиск дашбордов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="system">Системные</TabsTrigger>
          <TabsTrigger value="network">Сетевые</TabsTrigger>
          <TabsTrigger value="custom">Пользовательские</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDashboards(dashboards, searchQuery, "all").map((dashboard) => (
              <Card key={dashboard.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{dashboard.title}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </div>
                    <div className="rounded-full p-2 bg-primary/10">
                      <dashboard.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">Виджетов:</span>
                      <Badge variant="secondary" className="ml-2">
                        {dashboard.widgets}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">Обновлено: {dashboard.lastUpdated}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboards/${dashboard.id}`}>Просмотр</Link>
                    </Button>
                    <div className="flex gap-2">
                      {/* Кнопка генерации отчета для руководителей */}
                      {(userRole === "manager" || userRole === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generateReport(dashboard.id)}
                          title="Сформировать отчет"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Кнопки редактирования только для администраторов */}
                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dashboard)}
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateDashboard(dashboard)}
                            title="Дублировать"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dashboard)} title="Удалить">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Содержимое других вкладок */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDashboards(dashboards, searchQuery, "system").map((dashboard) => (
              <Card key={dashboard.id} className="overflow-hidden">
                {/* Такое же содержимое карточки, как и во вкладке "all" */}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{dashboard.title}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </div>
                    <div className="rounded-full p-2 bg-primary/10">
                      <dashboard.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">Виджетов:</span>
                      <Badge variant="secondary" className="ml-2">
                        {dashboard.widgets}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">Обновлено: {dashboard.lastUpdated}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboards/${dashboard.id}`}>Просмотр</Link>
                    </Button>
                    <div className="flex gap-2">
                      {/* Те же кнопки, что и во вкладке "all" */}
                      {(userRole === "manager" || userRole === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generateReport(dashboard.id)}
                          title="Сформировать отчет"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}

                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dashboard)}
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateDashboard(dashboard)}
                            title="Дублировать"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dashboard)} title="Удалить">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDashboards(dashboards, searchQuery, "network").map((dashboard) => (
              <Card key={dashboard.id} className="overflow-hidden">
                {/* Такое же содержимое карточки, как и во вкладке "all" */}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{dashboard.title}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </div>
                    <div className="rounded-full p-2 bg-primary/10">
                      <dashboard.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">Виджетов:</span>
                      <Badge variant="secondary" className="ml-2">
                        {dashboard.widgets}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">Обновлено: {dashboard.lastUpdated}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboards/${dashboard.id}`}>Просмотр</Link>
                    </Button>
                    <div className="flex gap-2">
                      {/* Те же кнопки, что и во вкладке "all" */}
                      {(userRole === "manager" || userRole === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generateReport(dashboard.id)}
                          title="Сформировать отчет"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}

                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dashboard)}
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateDashboard(dashboard)}
                            title="Дублировать"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dashboard)} title="Удалить">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDashboards(dashboards, searchQuery, "custom").map((dashboard) => (
              <Card key={dashboard.id} className="overflow-hidden">
                {/* Такое же содержимое карточки, как и во вкладке "all" */}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{dashboard.title}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </div>
                    <div className="rounded-full p-2 bg-primary/10">
                      <dashboard.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">Виджетов:</span>
                      <Badge variant="secondary" className="ml-2">
                        {dashboard.widgets}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">Обновлено: {dashboard.lastUpdated}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboards/${dashboard.id}`}>Просмотр</Link>
                    </Button>
                    <div className="flex gap-2">
                      {/* Те же кнопки, что и во вкладке "all" */}
                      {(userRole === "manager" || userRole === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generateReport(dashboard.id)}
                          title="Сформировать отчет"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}

                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dashboard)}
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateDashboard(dashboard)}
                            title="Дублировать"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dashboard)} title="Удалить">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Модальное окно создания дашборда */}
      {userRole === "admin" && (
        <>
          <Modal
            title="Создать дашборд"
            description="Создайте новый дашборд для мониторинга"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          >
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  placeholder="Введите название дашборда"
                  value={newDashboard.title}
                  onChange={(e) => setNewDashboard({ ...newDashboard, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Введите описание дашборда"
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Тип дашборда</Label>
                <Select
                  value={newDashboard.type}
                  onValueChange={(value) => setNewDashboard({ ...newDashboard, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип дашборда" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Системный</SelectItem>
                    <SelectItem value="network">Сетевой</SelectItem>
                    <SelectItem value="custom">Пользовательский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateDashboard}>Создать</Button>
              </div>
            </div>
          </Modal>

          {/* Модальное окно редактирования дашборда */}
          {selectedDashboard && (
            <Modal
              title="Редактировать дашборд"
              description="Измените настройки дашборда"
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
            >
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Название</Label>
                  <Input
                    id="edit-title"
                    value={editedDashboard.title}
                    onChange={(e) => setEditedDashboard({ ...editedDashboard, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Описание</Label>
                  <Textarea
                    id="edit-description"
                    value={editedDashboard.description}
                    onChange={(e) => setEditedDashboard({ ...editedDashboard, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Тип дашборда</Label>
                  <Select
                    value={editedDashboard.type}
                    onValueChange={(value) => setEditedDashboard({ ...editedDashboard, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип дашборда" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Системный</SelectItem>
                      <SelectItem value="network">Сетевой</SelectItem>
                      <SelectItem value="custom">Пользовательский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleUpdateDashboard}>Сохранить</Button>
                </div>
              </div>
            </Modal>
          )}

          {/* Модальное окно подтверждения удаления дашборда */}
          <AlertModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={onDelete}
            title="Удалить дашборд"
            description={`Вы уверены, что хотите удалить дашборд "${selectedDashboard?.title}"? Это действие нельзя будет отменить.`}
          />
        </>
      )}
    </div>
  )
}
