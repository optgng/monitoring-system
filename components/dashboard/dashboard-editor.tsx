"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, ArrowLeft, Plus } from "lucide-react"
import { dashboardApi } from "@/lib/dashboard-api"
import type { Dashboard } from "@/lib/dashboard-api"
import { getTagBadgeClass } from "@/lib/tag-colors"

interface DashboardEditorProps {
  uid?: string
  isCreating?: boolean
}

export function DashboardEditor({ uid, isCreating = false }: DashboardEditorProps) {
  const [dashboard, setDashboard] = useState<Partial<Dashboard>>({
    title: "",
    description: "",
    tags: [],
    timezone: "browser",
    refresh: "30s",
    time: {
      from: "now-1h",
      to: "now",
    },
    panels: [],
  })
  const [loading, setLoading] = useState(!isCreating)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isCreating && uid) {
      loadDashboard()
    }
  }, [uid, isCreating])

  const loadDashboard = async () => {
    if (!uid) return

    setLoading(true)
    try {
      const response = await dashboardApi.getDashboard(uid)
      if (response.status === "success") {
        setDashboard(response.data as Dashboard)
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let response
      if (isCreating) {
        response = await dashboardApi.createDashboard(dashboard)
      } else if (uid) {
        response = await dashboardApi.updateDashboard(uid, dashboard)
      }

      if (response?.status === "success") {
        router.push("/dashboards")
      }
    } catch (error) {
      console.error("Failed to save dashboard:", error)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !dashboard.tags?.includes(tagInput.trim())) {
      setDashboard((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setDashboard((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isCreating ? "Создание дашборда" : "Редактирование дашборда"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboards")}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !dashboard.title}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Основные настройки</TabsTrigger>
          <TabsTrigger value="panels">Панели</TabsTrigger>
          <TabsTrigger value="variables">Переменные</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Основные параметры дашборда</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название дашборда *</Label>
                <Input
                  id="title"
                  value={dashboard.title}
                  onChange={(e) => setDashboard((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название дашборда"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={dashboard.description || ""}
                  onChange={(e) => setDashboard((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Введите описание дашборда"
                />
              </div>

              <div className="space-y-2">
                <Label>Теги</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Добавить тег"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    Добавить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dashboard.tags?.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${getTagBadgeClass(tag)}`}
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="panels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Панели дашборда</CardTitle>
              <CardDescription>Управление панелями и их настройками</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Панели будут отображаться здесь после создания дашборда
                </p>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить панель
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Переменные дашборда</CardTitle>
              <CardDescription>Настройка переменных для фильтрации данных</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Переменные будут доступны после создания дашборда
                </p>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить переменную
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
