"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TAG_COLORS, getTagColor, getTagStyle, getAllTagColors, clearTagColorCache } from "@/lib/tag-colors"

export default function TestColorsPage() {
  const [tags, setTags] = useState<string[]>([
    "production", "staging", "development", "test",
    "monitoring", "network", "database", "security",
    "performance", "backup", "logs", "api", "frontend",
    "backend", "mobile", "web", "critical", "warning", "info",
    "application", "server", "client", "gateway", "proxy",
    "cache", "storage", "analytics", "metrics", "dashboard"
  ])

  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleClearCache = () => {
    clearTagColorCache()
    // Вызываем форсированное обновление компонента
    setTags([...tags])
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Тест цветов тегов</h1>

      <div className="mb-8 p-6 bg-slate-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Все доступные цвета ({TAG_COLORS.length})</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {getAllTagColors().map((color, index) => (
            <span
              key={index}
              style={{
                backgroundColor: color.bg,
                color: color.text,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontWeight: 500
              }}
            >
              Цвет {index + 1}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Всего доступно {TAG_COLORS.length} различных цветов для тегов
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="mb-8 p-6 bg-slate-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Тестовые теги ({tags.length})</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map(tag => {
              const style = getTagStyle(tag);
              return (
                <span
                  key={tag}
                  style={style}
                >
                  {tag}
                </span>
              )
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1"
              placeholder="Новый тег"
            />
            <Button onClick={handleAddTag}>
              Добавить
            </Button>
          </div>

          <Button variant="outline" onClick={handleClearCache} className="w-full">
            Очистить кеш цветов
          </Button>

          <p className="text-sm text-slate-500 mt-3">
            Очистка кеша может изменить распределение цветов
          </p>
        </div>

        <div className="mb-8 p-6 bg-slate-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Статистика распределения</h2>
          <div className="space-y-3 mb-4">
            {TAG_COLORS.map((color, index) => {
              const tagsWithThisColor = tags.filter(tag => {
                const tagColor = getTagColor(tag);
                return tagColor.bg === color.bg;
              });

              if (tagsWithThisColor.length === 0) return null;

              return (
                <div key={index} className="flex items-center gap-3">
                  <span style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    width: '24px',
                    height: '24px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500
                  }}>
                    {tagsWithThisColor.length}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Цвет {index + 1}</div>
                    <div className="text-xs text-slate-500">
                      {tagsWithThisColor.slice(0, 3).join(", ")}
                      {tagsWithThisColor.length > 3 ? ` и еще ${tagsWithThisColor.length - 3}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
