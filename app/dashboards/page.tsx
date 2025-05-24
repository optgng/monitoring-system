"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, BarChart3, LineChart, PieChart, Table2, Trash2, FileText, Search } from "lucide-react"
import Link from "next/link"
import { AlertModal } from "@/components/ui/alert-modal"
import { getCurrentUser } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"

export default function DashboardsPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })
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

  // Filter dashboards based on search query only
  const filteredDashboards = dashboards.filter((dashboard) => {
    return (
      !searchQuery ||
      dashboard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const showResultModal = (title: string, description: string, type: "success" | "error" = "success") => {
    setResultModal({ title, description, type })
    setIsResultModalOpen(true)
  }

  const handleDelete = (dashboard: any) => {
    setSelectedDashboard(dashboard)
    setIsDeleteModalOpen(true)
  }

  const onDelete = () => {
    // В реальном приложении здесь был бы API-запрос на удаление
    setIsDeleteModalOpen(false)
    showResultModal("Дашборд удален", `Дашборд "${selectedDashboard.title}" был успешно удален`)
  }

  const generateReport = (dashboardId: number) => {
    router.push(`/reports?dashboard=${dashboardId}`)
  }

  const handleDuplicateDashboard = (dashboard) => {
    // В реальном приложении здесь был бы API-запрос на дублирование
    showResultModal("Дашборд дублирован", `Копия дашборда "${dashboard.title}" была успешно создана`)
  }

  const handleCreateDashboard = () => {
    router.push("/dashboards/new")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Дашборды</h1>
        {userRole && userRole === "admin" && (
          <Button onClick={handleCreateDashboard}>
            <Plus className="mr-2 h-4 w-4" /> Добавить дашборд
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDashboards.map((dashboard) => (
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
                  <span className="font-medium">Панелей:</span>
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
                      <Button variant="ghost" size="icon" asChild title="Редактировать">
                        <Link href={`/dashboards/${dashboard.id}/settings`}>
                          <Edit className="h-4 w-4" />
                        </Link>
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

      {/* Модальное окно подтверждения удаления дашборда */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
        title="Удалить дашборд"
        description={`Вы уверены, что хотите удалить дашборд "${selectedDashboard?.title}"? Это действие нельзя будет отменить.`}
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
