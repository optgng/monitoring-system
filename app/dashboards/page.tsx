"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search, Settings, Star, Copy, Trash2, MoreHorizontal, Loader2, Filter, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getDashboards, deleteDashboard, duplicateDashboard } from "./actions"
import type { DashboardListItem } from "@/lib/dashboard-api"
import { dashboardApi } from "@/lib/dashboard-api"
import { getTagBadgeClass, getTagColorWithPresets, getTagHoverClass, getTagStyle, getTagHoverStyle } from "@/lib/tag-colors"

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<DashboardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [dashboardToDelete, setDashboardToDelete] = useState<DashboardListItem | null>(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })
  const [isAllTagsModalOpen, setIsAllTagsModalOpen] = useState(false)
  const [selectedDashboardTags, setSelectedDashboardTags] = useState<{ title: string; tags: string[] } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Получаем тег из URL при загрузке
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag')
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl)
    }
  }, [searchParams])

  const handleDeleteClick = (dashboard: DashboardListItem) => {
    setDashboardToDelete(dashboard)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!dashboardToDelete) return

    try {
      const response = await deleteDashboard(dashboardToDelete.uid)
      if (response.status === "success") {
        setDashboards(prev => prev.filter(d => d.uid !== dashboardToDelete.uid))
        showResultModal("Успех", "Дашборд успешно удален", "success")
      } else {
        showResultModal("Ошибка", response.message || "Не удалось удалить дашборд", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при удалении дашборда", "error")
    } finally {
      setIsDeleteModalOpen(false)
      setDashboardToDelete(null)
    }
  }

  const handleDuplicate = async (dashboard: DashboardListItem) => {
    try {
      const newTitle = `${dashboard.title} (Copy)`
      const response = await duplicateDashboard(dashboard.uid, newTitle)
      if (response.status === "success") {
        await loadDashboards()
        showResultModal("Успех", "Дашборд успешно дублирован", "success")
      } else {
        showResultModal("Ошибка", response.message || "Не удалось дублировать дашборд", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при дублировании дашборда", "error")
    }
  }

  const handleExport = async (dashboard: DashboardListItem) => {
    try {
      // Показываем индикатор загрузки
      showResultModal("Экспорт", "Подготовка файла для экспорта...", "success")

      let exportData = null
      let exportMethod = "unknown"

      try {
        // Метод 1: Используем API экспорта
        const response = await dashboardApi.exportDashboard(dashboard.uid)
        if (response.status === "success") {
          exportData = response.data
          exportMethod = "api"
        }
      } catch (apiError) {
        console.warn("API export failed, trying direct method:", apiError)
      }

      // Метод 2: Получаем дашборд напрямую через API списка
      if (!exportData) {
        try {
          const response = await dashboardApi.getDashboard(dashboard.uid)
          if (response.status === "success") {
            exportData = response.data
            exportMethod = "direct"
          }
        } catch (directError) {
          console.warn("Direct export failed:", directError)
        }
      }

      // Метод 3: Создаем минимальную структуру дашборда
      if (!exportData) {
        exportData = {
          dashboard: {
            uid: dashboard.uid,
            title: dashboard.title,
            description: dashboard.description || "",
            tags: dashboard.tags || [],
            panels: dashboard.panels || [],
            time: {
              from: "now-1h",
              to: "now"
            },
            timezone: "browser",
            schemaVersion: 16,
            version: 1,
            refresh: "30s"
          },
          meta: {
            type: "db",
            canSave: true,
            canEdit: true,
            url: `/d/${dashboard.uid}/${dashboard.title.toLowerCase().replace(/\s+/g, '-')}`,
            expires: "0001-01-01T00:00:00Z",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            version: 1
          }
        }
        exportMethod = "fallback"
      }

      // Подготавливаем данные для экспорта
      const exportJson = typeof exportData === 'string'
        ? exportData
        : JSON.stringify(exportData, null, 2)

      // Создаем и скачиваем файл
      const blob = new Blob([exportJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Генерируем имя файла
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const safeName = dashboard.title.replace(/[^a-zA-Z0-9\-_]/g, '_')
      link.download = `${safeName}_${timestamp}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Показываем результат
      const methodText = {
        api: "через API экспорта",
        direct: "прямым получением данных",
        fallback: "с базовой структурой"
      }[exportMethod]

      showResultModal(
        "Экспорт завершен",
        `Дашборд "${dashboard.title}" успешно экспортирован ${methodText}`,
        "success"
      )
    } catch (error) {
      console.error("Export error:", error)
      showResultModal(
        "Ошибка экспорта",
        error instanceof Error ? error.message : "Произошла ошибка при экспорте дашборда",
        "error"
      )
    }
  }

  const handleShowAllTags = (dashboard: DashboardListItem) => {
    setSelectedDashboardTags({
      title: dashboard.title,
      tags: dashboard.tags
    })
    setIsAllTagsModalOpen(true)
  }

  const showResultModal = (title: string, description: string, type: "success" | "error") => {
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
        setDashboards(Array.isArray(response.data) ? response.data as DashboardListItem[] : [response.data as DashboardListItem])
      } else {
        showResultModal("Ошибка загрузки", response.message || "Не удалось загрузить дашборды", "error")
      }
    } catch (error) {
      showResultModal("Ошибка", "Произошла ошибка при загрузке дашбордов", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredDashboards = dashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dashboard.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || dashboard.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(dashboards.flatMap((d) => d.tags)))

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
              <Button className="mt-4" onClick={() => router.push("/dashboards/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Создать дашборд
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDashboards.map((dashboard) => (
            <Card key={dashboard.uid} className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                    {dashboard.description && (
                      <CardDescription className="text-sm">
                        {dashboard.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboards/${dashboard.uid}`)
                      }}>
                        <Settings className="mr-2 h-4 w-4" />
                        Открыть
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(dashboard)
                      }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Дублировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleExport(dashboard)
                      }}>
                        <Download className="mr-2 h-4 w-4" />
                        Экспорт
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(dashboard)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                <div className="space-y-3">
                  {dashboard.tags && dashboard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dashboard.tags.slice(0, 3).map((tag) => {
                        const tagStyle = getTagStyle(tag);
                        const hoverStyle = { ...tagStyle, ...getTagHoverStyle(tag) };

                        return (
                          <span
                            key={tag}
                            style={tagStyle}
                            onMouseOver={(e) => {
                              Object.assign(e.currentTarget.style, hoverStyle);
                            }}
                            onMouseOut={(e) => {
                              Object.assign(e.currentTarget.style, tagStyle);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                            }}
                            className="text-xs cursor-pointer"
                          >
                            {tag}
                          </span>
                        )
                      })}
                      {dashboard.tags.length > 3 && (
                        <span
                          style={{
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            borderRadius: '0.25rem',
                            padding: '0.125rem 0.5rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowAllTags(dashboard);
                          }}
                          className="text-xs"
                        >
                          +{dashboard.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>Панелей:</span>
                      <span className="font-medium">
                        {dashboard.panels?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {dashboard.isStarred && <Star className="h-3 w-3 fill-current text-yellow-400" />}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div>UID: {dashboard.uid}</div>
                    {dashboard.updated && (
                      <div>Обновлено: {new Date(dashboard.updated).toLocaleDateString()}</div>
                    )}
                    {dashboard.created && (
                      <div>Создано: {new Date(dashboard.created).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить дашборд</DialogTitle>
            <DialogDescription>
              {`Вы уверены, что хотите удалить дашборд "${dashboardToDelete?.title}"? Это действие нельзя отменить.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resultModal.title}</DialogTitle>
            <DialogDescription>
              {resultModal.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsResultModalOpen(false)}>ОК</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно показа всех тегов */}
      <Dialog open={isAllTagsModalOpen} onOpenChange={setIsAllTagsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Все теги дашборда</DialogTitle>
            <DialogDescription>
              {selectedDashboardTags?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedDashboardTags?.tags.map((tag) => {
                const tagStyle = getTagStyle(tag);
                const hoverStyle = { ...tagStyle, ...getTagHoverStyle(tag) };

                return (
                  <span
                    key={tag}
                    style={tagStyle}
                    onMouseOver={(e) => {
                      Object.assign(e.currentTarget.style, hoverStyle);
                    }}
                    onMouseOut={(e) => {
                      Object.assign(e.currentTarget.style, tagStyle);
                    }}
                    onClick={() => {
                      setSelectedTag(tag);
                      setIsAllTagsModalOpen(false);
                    }}
                    className="text-sm cursor-pointer"
                  >
                    {tag}
                  </span>
                )
              })}
            </div>

            <div className="text-sm text-muted-foreground">
              Всего тегов: {selectedDashboardTags?.tags.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Кликните на тег, чтобы отфильтровать дашборды
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsAllTagsModalOpen(false)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

