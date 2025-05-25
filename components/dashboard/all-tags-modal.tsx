"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTagColorWithPresets, getTagHoverClass } from "@/lib/tag-colors"
import { X } from "lucide-react"

interface AllTagsModalProps {
  isOpen: boolean
  onClose: () => void
  dashboardTitle: string
  tags: string[]
  onTagSelect?: (tag: string) => void
}

export function AllTagsModal({
  isOpen,
  onClose,
  dashboardTitle,
  tags,
  onTagSelect
}: AllTagsModalProps) {
  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag)
    }
    onClose()
  }

  // Группируем теги по категориям для лучшего отображения
  const categorizedTags = tags.reduce((acc, tag) => {
    const category = getTagCategory(tag)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tag)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Все теги дашборда</DialogTitle>
              <DialogDescription className="mt-1">
                {dashboardTitle}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Статистика */}
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Всего тегов:</span> {tags.length}
            </div>
            <div className="text-sm">
              <span className="font-medium">Категорий:</span> {Object.keys(categorizedTags).length}
            </div>
          </div>

          {/* Теги по категориям */}
          {Object.entries(categorizedTags).map(([category, categoryTags]) => (
            <div key={category} className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground capitalize">
                {category} ({categoryTags.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => {
                  const colorClass = getTagColorWithPresets(tag)
                  const hoverClass = getTagHoverClass(tag)
                  return (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${colorClass.bg} ${colorClass.text} ${colorClass.border} border-0 font-medium ${hoverClass} transition-all duration-200 hover:scale-105`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Все теги в одном блоке (если предпочитаете без группировки) */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Все теги (кликните для фильтрации)
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const colorClass = getTagColorWithPresets(tag)
                const hoverClass = getTagHoverClass(tag)
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`cursor-pointer ${colorClass.bg} ${colorClass.text} ${colorClass.border} border-0 font-medium ${hoverClass} transition-all duration-200 hover:scale-105`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Кликните на тег, чтобы отфильтровать дашборды
          </div>
          <Button onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Вспомогательная функция для категоризации тегов
function getTagCategory(tag: string): string {
  const lowerTag = tag.toLowerCase()

  if (['production', 'staging', 'development', 'test', 'prod', 'dev', 'stage'].includes(lowerTag)) {
    return 'environment'
  }

  if (['api', 'frontend', 'backend', 'database', 'db', 'web', 'mobile'].includes(lowerTag)) {
    return 'technology'
  }

  if (['monitoring', 'metrics', 'logs', 'alerts', 'health', 'performance'].includes(lowerTag)) {
    return 'monitoring'
  }

  if (['network', 'security', 'backup', 'infrastructure', 'server'].includes(lowerTag)) {
    return 'infrastructure'
  }

  return 'other'
}
