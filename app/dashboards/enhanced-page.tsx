"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Settings, Calendar, Plus, RefreshCw, Filter, Star, StarOff, XCircle,
  Pencil, Copy, Trash2, MoreVertical, Eye, ExternalLink
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardApi, DashboardListItem } from "@/lib/dashboard-api"
import { formatDate } from "@/lib/utils"
import { getTagStyle } from "@/lib/tag-colors"
import { DashboardFilterPanel, DashboardFilters } from "@/components/dashboard/dashboard-filter-panel"
import { toast } from "sonner"
import { AlertModal } from "@/components/ui/alert-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function EnhancedDashboardsPage() {
  const [dashboards, setDashboards] = useState<DashboardListItem[]>([])
  const [filteredDashboards, setFilteredDashboards] = useState<DashboardListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardToDelete, setDashboardToDelete] = useState<DashboardListItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  // Фильтры
  const [filters, setFilters] = useState<DashboardFilters>({
    search: "",
    tags: [],
    sortBy: "title",
    sortOrder: "asc",
  })

  // Функция для обновления конкретного дашборда в списке
  const updateDashboardInList = useCallback((updatedDashboard: DashboardListItem) => {
    setDashboards(prev => prev.map(d =>
      d.uid === updatedDashboard.uid ? updatedDashboard : d
    ))
  }, [])

  // Функция для добавления нового дашборда в список
  const addDashboardToList = useCallback((newDashboard: DashboardListItem) => {
    setDashboards(prev => [newDashboard, ...prev])
  }, [])

  // Загрузка дашбордов - убираем все зависимости от filters
  const loadDashboards = useCallback(async (showRefreshing = false, customSearch = '', customTags: string[] = []) => {
    console.log('loadDashboards called with:', { showRefreshing, customSearch, customTags });

    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await dashboardApi.listDashboards({
        search: customSearch || filters.search,
        tags: customTags.length > 0 ? customTags.join(',') : (filters.tags.length > 0 ? filters.tags.join(',') : undefined),
        limit: filters.limit,
      })

      if (response.status === 'success') {
        const dashboardsData = Array.isArray(response.data) ? response.data : []
        console.log('Dashboards loaded:', dashboardsData.length);
        setDashboards(dashboardsData)
      } else {
        setError(response.message || "Не удалось загрузить дашборды")
      }
    } catch (error) {
      console.error("Ошибка при загрузке дашбордов:", error)
      setError("Произошла ошибка при загрузке дашбордов")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, []) // Убираем ВСЕ зависимости

  // Обработчик изменения фильтров
  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters)
  }

  // Функция для удаления дашборда - динамическое обновление
  const handleDeleteDashboard = async () => {
    if (!dashboardToDelete) return;

    console.log('Deleting dashboard:', dashboardToDelete.uid);

    try {
      setRefreshing(true);
      const response = await dashboardApi.deleteDashboard(dashboardToDelete.uid);
      console.log('Delete response:', response);

      // Проверяем успешность по разным вариантам ответа
      if (response.status === 'success' || response.message === 'Dashboard deleted successfully') {
        console.log('Dashboard deleted successfully, updating list...');

        // Закрываем модальное окно
        setIsDeleteModalOpen(false);
        setDashboardToDelete(null);

        // Динамически удаляем дашборд из списка
        setDashboards(prev => prev.filter(d => d.uid !== dashboardToDelete.uid));

        // Показываем toast
        toast.success("Дашборд успешно удален");

      } else {
        console.error('Delete failed:', response);
        toast.error(response.message || "Не удалось удалить дашборд");
      }
    } catch (error) {
      console.error("Ошибка при удалении дашборда:", error);
      toast.error("Произошла ошибка при удалении дашборда");
    } finally {
      setRefreshing(false);
    }
  };

  // Функция для дублирования дашборда - динамическое обновление
  const handleDuplicateDashboard = async (dashboard: DashboardListItem) => {
    if (!dashboard.uid) {
      toast.error("UID дашборда не найден, невозможно дублировать.");
      return;
    }

    console.log('Duplicating dashboard:', dashboard.uid);

    try {
      setRefreshing(true);
      const response = await dashboardApi.duplicateDashboard(dashboard.uid);
      console.log('Duplicate response:', response);

      // Проверяем успешность - если нет явной ошибки, считаем успешным
      const hasError = response.status === 'error';
      const isSuccess = response.status === 'success' || response.data || !hasError;

      if (isSuccess && !hasError) {
        console.log('Dashboard duplicated successfully');

        toast.success("Дашборд успешно дублирован");

        // Если есть данные о новом дашборде, добавляем его в список
        if (response.data && response.data.uid) {
          const newDashboard: DashboardListItem = {
            uid: response.data.uid,
            title: response.data.title || `${dashboard.title} (копия)`,
            description: response.data.description || dashboard.description || "",
            tags: response.data.tags || dashboard.tags || [],
            isStarred: false,
            created: response.data.created || new Date().toISOString(),
            updated: response.data.updated || new Date().toISOString(),
            panelCount: response.data.panels ? response.data.panels.length : (dashboard.panelCount || 0)
          };

          // Динамически добавляем новый дашборд в начало списка
          setDashboards(prev => [newDashboard, ...prev]);

          // Предлагаем перейти к новому дашборду
          const shouldRedirect = confirm("Хотите перейти к новому дашборду?");
          if (shouldRedirect) {
            console.log('Redirecting to new dashboard...');
            router.push(`/dashboards/${response.data.uid}`);
            return;
          }
        } else {
          // Если нет данных о новом дашборде, просто перезагружаем список
          console.log('No new dashboard data, reloading list...');
          await loadDashboards(true, filters.search, filters.tags);
        }

      } else {
        console.error('Duplicate failed:', response);
        toast.error(response.message || "Не удалось дублировать дашборд");
      }
    } catch (error) {
      console.error("Ошибка при дублировании дашборда:", error);
      toast.error("Произошла ошибка при дублировании дашборда");
    } finally {
      setRefreshing(false);
    }
  };

  // УПРОЩЕННЫЕ useEffect - убираем все конфликты

  // Только начальная загрузка
  useEffect(() => {
    console.log('Initial load useEffect triggered');
    loadDashboards();
  }, []); // Пустой массив зависимостей

  // Применение локальных фильтров - убираем зависимость от applyLocalFilters
  useEffect(() => {
    console.log('Applying local filters to dashboards:', dashboards.length);

    let filtered = [...dashboards]

    // Применяем поиск локально
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        dashboard =>
          dashboard.title.toLowerCase().includes(searchLower) ||
          (dashboard.description && dashboard.description.toLowerCase().includes(searchLower))
      )
    }

    // Применяем фильтр по тегам локально
    if (filters.tags.length > 0) {
      filtered = filtered.filter(dashboard =>
        filters.tags.every(tag => dashboard.tags.includes(tag))
      )
    }

    // Сортировка результатов
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.created || '').getTime() || 0
          bValue = new Date(b.created || '').getTime() || 0
          break
        case 'updated':
          aValue = new Date(a.updated || '').getTime() || 0
          bValue = new Date(b.updated || '').getTime() || 0
          break
        case 'panelCount':
          aValue = typeof a.panelCount === 'number' ? a.panelCount : 0
          bValue = typeof b.panelCount === 'number' ? b.panelCount : 0
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      const sortFactor = filters.sortOrder === 'asc' ? 1 : -1

      if (aValue < bValue) return -1 * sortFactor
      if (aValue > bValue) return 1 * sortFactor
      return 0
    })

    // Ограничение количества результатов
    if (filters.limit && filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit)
    }

    console.log('Filtered dashboards:', filtered.length);
    setFilteredDashboards(filtered);
  }, [dashboards, filters.search, filters.tags, filters.sortBy, filters.sortOrder, filters.limit]);

  // Обработчик фильтрации - реагируем на изменения поиска и тегов
  useEffect(() => {
    console.log('Filters changed, reloading from API:', { search: filters.search, tags: filters.tags });

    // Используем таймер для debounce
    const timer = setTimeout(() => {
      if (dashboards.length > 0) { // Загружаем только если уже есть данные
        loadDashboards(true, filters.search, filters.tags);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search, filters.tags]);

  // Обработчик события применения фильтров - УПРОЩАЕМ
  useEffect(() => {
    const handleApplyFilters = () => {
      console.log('Apply filters event received - forcing reload');
      loadDashboards(true, filters.search, filters.tags);
    };

    window.addEventListener('apply-dashboard-filters', handleApplyFilters);

    return () => {
      window.removeEventListener('apply-dashboard-filters', handleApplyFilters);
    };
  }, [filters.search, filters.tags]); // Добавляем зависимости

  // Отображение страницы при загрузке
  if (loading && !refreshing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Дашборды</h1>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <Skeleton className="w-full h-64" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-48" />
          ))}
        </div>
      </div>
    )
  }

  // Отображаем ошибку
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Дашборды</h1>
          <Button variant="outline" onClick={() => loadDashboards()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить загрузку
          </Button>
        </div>

        <Card className="w-full bg-destructive/10 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <XCircle className="mr-2 h-5 w-5" />
              Ошибка загрузки
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Дашборды</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => loadDashboards(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button onClick={() => router.push('/dashboards/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Создать дашборд
          </Button>
        </div>
      </div>

      <DashboardFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        dashboards={dashboards}
        isLoading={refreshing}
      />

      {filteredDashboards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDashboards.map((dashboard) => (
            <Card
              key={dashboard.uid || `dashboard-${Math.random()}`}
              className="hover:shadow-lg transition-shadow group"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 cursor-pointer" onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                    <CardTitle className="line-clamp-1">{dashboard.title}</CardTitle>
                    {dashboard.description ? (
                      <CardDescription className="line-clamp-2 pt-1">
                        {dashboard.description}
                      </CardDescription>
                    ) : (
                      <CardDescription className="line-clamp-2 pt-1">
                        &nbsp;
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboard.uid}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateDashboard(dashboard);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Дублировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setDashboardToDelete(dashboard);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="cursor-pointer" onClick={() => router.push(`/dashboards/${dashboard.uid}`)}>
                <div className="space-y-3">
                  {dashboard.tags && dashboard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dashboard.tags.map((tag) => (
                        <Badge key={tag} variant="outline" style={getTagStyle(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {dashboard.panelCount !== undefined ?
                          `${dashboard.panelCount} ${dashboard.panelCount === 1 ? 'панель' :
                            (dashboard.panelCount >= 2 && dashboard.panelCount <= 4) ? 'панели' : 'панелей'}` :
                          'Загрузка...'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dashboard.updated ? formatDate(dashboard.updated || "") : formatDate(dashboard.created || "")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full py-16">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-muted rounded-full">
              {dashboards.length === 0 ? (
                <Plus className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Filter className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <CardTitle>
              {dashboards.length === 0 ? "Нет дашбордов" : "Дашборды не найдены"}
            </CardTitle>
            <CardDescription className="max-w-[400px]">
              {dashboards.length === 0
                ? "У вас еще нет дашбордов. Создайте первый дашборд для начала мониторинга."
                : "По заданным критериям фильтрации не найдено ни одного дашборда."}
            </CardDescription>
            {dashboards.length === 0 ? (
              <Button onClick={() => router.push('/dashboards/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Создать дашборд
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  handleFiltersChange({
                    search: "",
                    tags: [],
                    sortBy: "title",
                    sortOrder: "asc",
                  })
                }
              >
                Сбросить фильтры
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteDashboard}
        loading={refreshing}
        title="Удалить дашборд"
        description={`Вы уверены, что хотите удалить дашборд "${dashboardToDelete?.title}"? Это действие нельзя отменить.`}
      />
    </div>
  )
}