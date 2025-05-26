"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Settings,
  Star,
  Copy,
  Trash2,
  MoreHorizontal,
  Loader2,
  Download,
  RefreshCw,
  Upload,
  Eye,
  Edit,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getDashboards, deleteDashboard, duplicateDashboard } from "./actions"
import { dashboardApi, DashboardListItem, Dashboard } from "@/lib/dashboard-api"
import { getTagStyle, getTagHoverStyle } from "@/lib/tag-colors"
import { DashboardFilterPanel, DashboardFilters } from "@/components/dashboard/dashboard-filter-panel"
import { DashboardImportExport } from "@/components/dashboard/dashboard-import-export"
import { toast } from "sonner"

export default function EnhancedDashboardsPage() {
  const [dashboards, setDashboards] = useState<DashboardListItem[]>([])
  const [filteredDashboards, setFilteredDashboards] = useState<DashboardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>({
    search: '',
    tags: [],
    starred: undefined,
    limit: undefined,
    sortBy: 'title',
    sortOrder: 'asc',
    dateRange: undefined
  })

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [dashboardToDelete, setDashboardToDelete] = useState<DashboardListItem | null>(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultModal, setResultModal] = useState({ title: "", description: "", type: "success" })

  const router = useRouter()
  const searchParams = useSearchParams()

  // Получаем тег из URL при загрузке
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag')
    if (tagFromUrl) {
      setFilters(prev => ({ ...prev, tags: [tagFromUrl] }))
    }
  }, [searchParams])

  // Загрузка дашбордов
  const loadDashboards = useCallback(async (useFilters = false) => {
    try {
      setLoading(true)
      let response

      if (useFilters) {
        // Используем расширенный API с фильтрами
        const filterParams = {
          ...(filters.search && { search: filters.search }),
          ...(filters.tags.length > 0 && { tag: filters.tags[0] }), // API поддерживает один тег
          ...(filters.starred !== undefined && { starred: filters.starred }),
          ...(filters.limit && { limit: filters.limit })
        }
        response = await dashboardApi.listDashboardsWithFilters(filterParams)
      } else {
        // Используем базовый API
        response = await getDashboards()
      } if (response.status === "success") {
        const dashboardData = Array.isArray(response.data) ? response.data : [response.data]
        setDashboards(dashboardData)
        if (!useFilters) {
          setFilteredDashboards(dashboardData)
        }
      } else {
        toast.error(response.message || "Не удалось загрузить дашборды")
      }
    } catch (error) {
      console.error('Ошибка загрузки дашбордов:', error)
      toast.error("Произошла ошибка при загрузке дашбордов")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  // Применение локальных фильтров
  const applyLocalFilters = useCallback(() => {
    let filtered = [...dashboards]

    // Поиск по названию и описанию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(dashboard =>
        dashboard.title.toLowerCase().includes(searchLower) ||
        (dashboard.description && dashboard.description.toLowerCase().includes(searchLower))
      )
    }

    // Фильтр по тегам
    if (filters.tags.length > 0) {
      filtered = filtered.filter(dashboard =>
        filters.tags.some(tag => dashboard.tags.includes(tag))
      )
    }

    // Фильтр по избранным
    if (filters.starred !== undefined) {
      filtered = filtered.filter(dashboard => dashboard.isStarred === filters.starred)
    }

    // Фильтр по дате
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(dashboard => {
        const createdDate = new Date(dashboard.created)
        const fromDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : null
        const toDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : null

        if (fromDate && createdDate < fromDate) return false
        if (toDate && createdDate > toDate) return false
        return true
      })
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.created)
          bValue = new Date(b.created)
          break
        case 'updated':
          aValue = new Date(a.updated)
          bValue = new Date(b.updated)
          break
        case 'panelCount':
          aValue = a.panelCount || 0
          bValue = b.panelCount || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Лимит
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    setFilteredDashboards(filtered)
  }, [dashboards, filters])

  // Загрузка при монтировании
  useEffect(() => {
    loadDashboards()
  }, [])

  // Применение фильтров при их изменении
  useEffect(() => {
    applyLocalFilters()
  }, [applyLocalFilters])

  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboards()
  }

  const handleApplyFilters = () => {
    // Можно использовать как локальную фильтрацию, так и серверную
    applyLocalFilters()
    toast.success("Фильтры применены")
  }

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
        toast.success("Дашборд успешно удален")
      } else {
        toast.error(response.message || "Не удалось удалить дашборд")
      }
    } catch (error) {
      toast.error("Произошла ошибка при удалении дашборда")
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
        toast.success("Дашборд успешно дублирован")
      } else {
        toast.error(response.message || "Не удалось дублировать дашборд")
      }
    } catch (error) {
      toast.error("Произошла ошибка при дублировании дашборда")
    }
  }

  const handleExport = async (dashboard: DashboardListItem) => {
    try {
      const response = await dashboardApi.exportDashboard(dashboard.uid)
      if (response.status === "success") {
        // Создаем файл для скачивания
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `dashboard-${dashboard.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("Дашборд экспортирован")
      } else {
        toast.error(response.message || "Не удалось экспортировать дашборд")
      }
    } catch (error) {
      toast.error("Произошла ошибка при экспорте дашборда")
    }
  }

  const handleImportSuccess = async (dashboard: Dashboard) => {
    await loadDashboards()
    toast.success(`Дашборд "${dashboard.title}" успешно импортирован`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка дашбордов...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Дашборды</h1>
          <p className="text-muted-foreground">
            Управление дашбордами мониторинга
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <DashboardImportExport
            onImportSuccess={handleImportSuccess}
            trigger={
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </Button>
            }
          />
          <Button onClick={() => router.push('/dashboards/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать дашборд
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего дашбордов</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отфильтровано</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDashboards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Избранные</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboards.filter(d => d.isStarred).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего панелей</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboards.reduce((sum, d) => sum + (d.panelCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <DashboardFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        dashboards={dashboards}
        isLoading={refreshing}
        onApplyFilters={handleApplyFilters}
      />

      {/* Dashboards Grid */}
      {filteredDashboards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Дашборды не найдены</h3>
            <p className="text-muted-foreground text-center mb-4">
              {dashboards.length === 0
                ? "Создайте свой первый дашборд для начала работы"
                : "Попробуйте изменить фильтры или поисковый запрос"
              }
            </p>
            <Button onClick={() => router.push('/dashboards/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Создать дашборд
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDashboards.map((dashboard) => (
            <Card key={dashboard.uid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {dashboard.title}
                      </CardTitle>
                      {dashboard.isStarred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {dashboard.description && (
                      <CardDescription className="line-clamp-2">
                        {dashboard.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Просмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboard.uid}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDuplicate(dashboard)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Дублировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(dashboard)}>
                        <Download className="h-4 w-4 mr-2" />
                        Экспортировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(dashboard)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Tags */}
                  {dashboard.tags && dashboard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dashboard.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer"
                          style={getTagStyle(tag)}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag]
                          }))}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {dashboard.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{dashboard.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {dashboard.panelCount || 0} панелей
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(dashboard.updated)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboards/${dashboard.uid}`)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Открыть
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboards/${dashboard.uid}/edit`)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Удаление дашборда
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить дашборд "{dashboardToDelete?.title}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
