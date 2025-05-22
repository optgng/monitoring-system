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
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
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
    setIsEditModalOpen(true)
  }

  const handleDelete = (dashboard: any) => {
    setSelectedDashboard(dashboard)
    setIsDeleteModalOpen(true)
  }

  const onDelete = () => {
    // Here would be the logic to delete the dashboard
    setIsDeleteModalOpen(false)
  }

  const generateReport = (dashboardId: number) => {
    router.push(`/reports?dashboard=${dashboardId}`)
  }

  const handleCreateDashboard = () => {
    // Here would be the logic to create a new dashboard
    setIsCreateModalOpen(false)
    // Redirect to the new dashboard
    router.push(`/dashboards/new`)
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="container py-6">
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
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
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
                            {/* Report generation button for managers and admins */}
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

                            {/* Edit buttons only for admins */}
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
                                <Button variant="ghost" size="icon" title="Дублировать">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(dashboard)}
                                  title="Удалить"
                                >
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

              {/* Other tabs content */}
              <TabsContent value="system" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filterDashboards(dashboards, searchQuery, "system").map((dashboard) => (
                    <Card key={dashboard.id} className="overflow-hidden">
                      {/* Same card content as in "all" tab */}
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
                            {/* Same buttons as in "all" tab */}
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
                                <Button variant="ghost" size="icon" title="Дублировать">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(dashboard)}
                                  title="Удалить"
                                >
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
                      {/* Same card content as in "all" tab */}
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
                            {/* Same buttons as in "all" tab */}
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
                                <Button variant="ghost" size="icon" title="Дублировать">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(dashboard)}
                                  title="Удалить"
                                >
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
                      {/* Same card content as in "all" tab */}
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
                            {/* Same buttons as in "all" tab */}
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
                                <Button variant="ghost" size="icon" title="Дублировать">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(dashboard)}
                                  title="Удалить"
                                >
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

            {/* Create Dashboard Modal */}
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
                      <Input id="title" placeholder="Введите название дашборда" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea id="description" placeholder="Введите описание дашборда" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Тип дашборда</Label>
                      <Select>
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

                {/* Edit Dashboard Modal */}
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
                        <Input id="edit-title" defaultValue={selectedDashboard.title} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Описание</Label>
                        <Textarea id="edit-description" defaultValue={selectedDashboard.description} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-type">Тип дашборда</Label>
                        <Select defaultValue={selectedDashboard.type}>
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
                        <Button onClick={() => setIsEditModalOpen(false)}>Сохранить</Button>
                      </div>
                    </div>
                  </Modal>
                )}

                {/* Delete Dashboard Confirmation */}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
