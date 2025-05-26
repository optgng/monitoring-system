"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Star,
  Tag,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  RefreshCw
} from 'lucide-react'
import { DashboardListItem } from '@/lib/dashboard-api'

export interface DashboardFilters {
  search: string
  tags: string[]
  starred?: boolean
  limit?: number
  sortBy: 'title' | 'created' | 'updated' | 'panelCount'
  sortOrder: 'asc' | 'desc'
  dateRange?: {
    from?: string
    to?: string
  }
}

interface DashboardFilterPanelProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  dashboards: DashboardListItem[]
  isLoading?: boolean
  onApplyFilters?: () => void
}

export function DashboardFilterPanel({
  filters,
  onFiltersChange,
  dashboards,
  isLoading = false,
  onApplyFilters
}: DashboardFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Извлекаем доступные теги из дашбордов
  useEffect(() => {
    const tags = new Set<string>()
    dashboards.forEach(dashboard => {
      dashboard.tags?.forEach(tag => tags.add(tag))
    })
    setAvailableTags(Array.from(tags).sort())
  }, [dashboards])

  const updateFilters = (updates: Partial<DashboardFilters>) => {
    const newFilters = { ...filters, ...updates }
    onFiltersChange(newFilters)
  }

  const handleTagToggle = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag)
    updateFilters({ tags: newTags })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tags: [],
      starred: undefined,
      limit: undefined,
      sortBy: 'title',
      sortOrder: 'asc',
      dateRange: undefined
    })
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.tags.length > 0 ||
    filters.starred !== undefined ||
    filters.limit !== undefined ||
    filters.dateRange !== undefined

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.tags.length +
    (filters.starred !== undefined ? 1 : 0) +
    (filters.limit !== undefined ? 1 : 0) +
    (filters.dateRange ? 1 : 0)

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-base">Фильтры и поиск</CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilters()
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Очистить
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Поиск */}
            <div className="space-y-2">
              <Label htmlFor="search-dashboards">Поиск по названию или описанию</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-dashboards"
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  placeholder="Поиск дашбордов..."
                  className="pl-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Теги */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Теги
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-2 p-2 border rounded">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={filters.tags.includes(tag)}
                          onCheckedChange={(checked) =>
                            handleTagToggle(tag, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`tag-${tag}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Теги не найдены</p>
                  )}
                </div>
              </div>

              {/* Сортировка и фильтры */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Сортировка</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilters({ sortBy: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">По названию</SelectItem>
                      <SelectItem value="created">По дате создания</SelectItem>
                      <SelectItem value="updated">По дате обновления</SelectItem>
                      <SelectItem value="panelCount">По количеству панелей</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Порядок</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) => updateFilters({ sortOrder: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">По возрастанию</SelectItem>
                      <SelectItem value="desc">По убыванию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Лимит результатов</Label>
                  <Select
                    value={filters.limit?.toString() || 'all'}
                    onValueChange={(value) =>
                      updateFilters({ limit: value === 'all' ? undefined : parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Дополнительные фильтры */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="starred-only"
                    checked={filters.starred === true}
                    onCheckedChange={(checked) =>
                      updateFilters({ starred: checked ? true : undefined })
                    }
                  />
                  <Label htmlFor="starred-only" className="flex items-center gap-2 cursor-pointer">
                    <Star className="h-4 w-4" />
                    Только избранные
                  </Label>
                </div>

                {/* Фильтр по дате создания */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Дата создания
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateRange?.from || ''}
                      onChange={(e) => updateFilters({
                        dateRange: {
                          ...filters.dateRange,
                          from: e.target.value || undefined
                        }
                      })}
                      placeholder="От"
                    />
                    <Input
                      type="date"
                      value={filters.dateRange?.to || ''}
                      onChange={(e) => updateFilters({
                        dateRange: {
                          ...filters.dateRange,
                          to: e.target.value || undefined
                        }
                      })}
                      placeholder="До"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Выбранные фильтры */}
            {hasActiveFilters && (
              <div className="space-y-2">
                <Label>Активные фильтры:</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary" className="gap-1">
                      Поиск: "{filters.search}"
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateFilters({ search: '' })}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTagToggle(tag, false)}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.starred && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      Избранные
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateFilters({ starred: undefined })}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.limit && (
                    <Badge variant="secondary" className="gap-1">
                      Лимит: {filters.limit}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateFilters({ limit: undefined })}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Кнопка применения фильтров */}
            {onApplyFilters && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={onApplyFilters}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Применение...
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      Применить
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
