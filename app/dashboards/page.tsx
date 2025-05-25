"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Copy, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Modal } from "@/components/ui/modal"
import { getDashboards, deleteDashboard, duplicateDashboard } from "./actions"
import type { Dashboard } from "@/lib/dashboard-api"

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })
  const router = useRouter()

  const showResultModal = (title: string, description: string, type: "success" | "error" = "success") => {
    setResultModal({ title, description, type })
    setIsResultModalOpen(true)
  }

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    setLoading(true)
    try {
      const response = await getDashboards()
      if (response.status === "success") {
        setDashboards(response.data)
      } else {
        showResultModal("Ошибка загрузки", response.message || "Не удалось загрузить дашборды", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при загрузке дашбордов", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDashboard = async () => {
    if (!dashboardToDelete) return

    try {
      const response = await deleteDashboard(dashboardToDelete.uid)
      if (response.status === "success") {
        setDashboards((prev) => prev.filter((d) => d.uid !== dashboardToDelete.uid))
        showResultModal("Дашборд удален", "Дашборд был успешно удален")
      } else {
        showResultModal("Ошибка удаления", response.message || "Не удалось удалить дашборд", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при удалении дашборда", "error")
    } finally {
      setIsDeleteModalOpen(false)
      setDashboardToDelete(null)
    }
  }

  const handleDuplicateDashboard = async (dashboard: Dashboard) => {
    try {
      const response = await duplicateDashboard(dashboard.uid)
      if (response.status === "success") {
        await loadDashboards() // Reload to show the new dashboard
        showResultModal("Дашборд скопирован", "Дашборд был успешно скопирован")
      } else {
        showResultModal("Ошибка копирования", response.message || "Не удалось скопировать дашборд", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при копировании дашборда", "error")
    }
  }

  const filteredDashboards = dashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || dashboard.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(dashboards.flatMap((d) => d.tags)))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Менее часа назад"
    if (diffInHours < 24) return `${diffInHours} ч. назад`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дн. назад`
    return date.toLocaleDateString("ru-RU")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-8">
          <h1 className="text-3xl font-bold tracking-tight">Дашборды</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Создать дашборд
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Дашборды</h1>
        <Button onClick={() => router.push("/dashboards/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Создать дашборд
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск дашбордов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {selectedTag ? selectedTag : "Все теги"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedTag(null)}>Все теги</DropdownMenuItem>
            <DropdownMenuSeparator />
            {allTags.map((tag) => (
              <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                {tag}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredDashboards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium">Дашборды не найдены</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || selectedTag
                  ? "Попробуйте изменить критерии поиска"
                  : "Создайте свой первый дашборд для мониторинга системы"}
              </p>
              {!searchTerm && !selectedTag && (
                <Button className="mt-4" onClick={() => router.push("/dashboards/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать дашборд
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDashboards.map((dashboard) => (
            <Card key={dashboard.uid} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                    <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                    <CardDescription className="mt-1">{dashboard.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                        Открыть
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboard.uid}/settings`)}>
                        Настройки
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDuplicateDashboard(dashboard)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Дублировать
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Экспорт
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setDashboardToDelete(dashboard)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{dashboard.panels?.length || 0} панелей</span>
                  <span>{formatDate(dashboard.updated || dashboard.created)}</span>
                </div>
                {dashboard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dashboard.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {dashboard.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{dashboard.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Удалить дашборд"
        description={`Вы уверены, что хотите удалить дашборд "${dashboardToDelete?.title}"? Это действие нельзя отменить.`}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDeleteDashboard}>
            Удалить
          </Button>
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
