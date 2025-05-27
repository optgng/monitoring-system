"use client"

import { useState } from "react"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getTagStyle } from "@/lib/tag-colors"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardListItem } from "@/lib/dashboard-api"
import { RefreshCw, Search } from "lucide-react"

export interface DashboardFilters {
  search: string
  tags: string[]
  starred?: boolean
  limit?: number
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface DashboardFilterPanelProps {
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
  const [expanded, setExpanded] = useState(false)

  // Извлечение всех уникальных тегов из дашбордов
  const allTags = Array.from(
    new Set(dashboards.flatMap((dashboard) => dashboard.tags || []))
  ).sort()

  // Проверка наличия активных фильтров
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.tags.length > 0 ||
    filters.sortBy !== 'title' ||
    filters.sortOrder !== 'asc'
  )

  // Простая реализация поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  // Функция для добавления тега в фильтры
  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      onFiltersChange({ ...filters, tags: [...filters.tags, tag] });
    }
  };

  // Функция для удаления тега из фильтров
  const removeTag = (tag: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter(t => t !== tag)
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Фильтры</CardTitle>
        <CardDescription>Настройте фильтры для списка дашбордов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Строка поиска и кнопка разворачивания */}
          <div className="flex items-center gap-4 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Поиск по названию или описанию..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pr-8 w-full"
              />
              {filters.search && (
                <button
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0"
              aria-label={expanded ? "Свернуть фильтры" : "Развернуть фильтры"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Развернутые фильтры */}
          <div className={cn(
            "grid gap-4 overflow-hidden transition-all duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4",
            expanded
              ? "grid-rows-[1fr] opacity-100 max-h-96"
              : "grid-rows-[0fr] opacity-0 max-h-0"
          )}>
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Tags */}
                <div>
                  <Label className="mb-1 block text-sm font-medium">Теги</Label>
                  <div className="flex flex-wrap gap-2 mt-2 border p-2 rounded-md min-h-[50px] max-h-[150px] overflow-auto">
                    {allTags.length > 0 ? (
                      allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? "default" : "outline"}
                          style={filters.tags.includes(tag) ? getTagStyle(tag) : undefined}
                          className="cursor-pointer"
                          onClick={() => filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Нет доступных тегов</span>
                    )}
                  </div>
                </div>

                {/* Сортировка */}
                <div>
                  <Label className="mb-1 block text-sm font-medium">Сортировка</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: string) => onFiltersChange({ ...filters, sortBy: value })}
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
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => onFiltersChange({ ...filters, sortOrder: value })}
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
                </div>
              </div>
            </div>
          </div>

          {/* Активные фильтры */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
              <span className="text-sm text-muted-foreground">Активные фильтры:</span>

              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Поиск: {filters.search}</span>
                  <X
                    className="h-3 w-3 cursor-pointer ml-1"
                    onClick={() => onFiltersChange({ ...filters, search: '' })}
                  />
                </Badge>
              )}

              {filters.tags.length > 0 && filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1" style={getTagStyle(tag)}>
                  <span>{tag}</span>
                  <X
                    className="h-3 w-3 cursor-pointer ml-1"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}

              {(filters.sortBy !== 'title' || filters.sortOrder !== 'asc') && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>
                    Сортировка:
                    {filters.sortBy === 'title' ? ' По названию' :
                      filters.sortBy === 'created' ? ' По дате создания' :
                        filters.sortBy === 'updated' ? ' По дате обновления' :
                          ' По количеству панелей'}
                    {filters.sortOrder === 'asc' ? ' (↑)' : ' (↓)'}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer ml-1"
                    onClick={() => onFiltersChange({ ...filters, sortBy: 'title', sortOrder: 'asc' })}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3">
        <Button
          variant="outline"
          onClick={() => onFiltersChange({
            search: '',
            tags: [],
            starred: undefined,
            limit: undefined,
            sortBy: 'title',
            sortOrder: 'asc',
          })}
          disabled={isLoading}
        >
          Сбросить
        </Button>
        {/* Убираем кнопку "Применить фильтры" - теперь работает автоматически */}
      </CardFooter>
    </Card >
  )
}
