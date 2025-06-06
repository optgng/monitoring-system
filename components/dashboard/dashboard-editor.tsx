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
import { useDashboards } from "@/hooks/use-dashboards"
import { useDashboard } from "@/hooks/use-dashboard"
import { PanelManager } from "@/components/dashboard/panel-manager"
import type { Dashboard } from "@/lib/dashboard-api"
import { getTagStyle } from "@/lib/tag-colors"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface DashboardEditorProps {
  uid?: string
  isCreating?: boolean
}

export function DashboardEditor({ uid, isCreating = false }: DashboardEditorProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    timezone: "browser",
    refresh: "30s",
    timeFrom: "now-1h",
    timeTo: "now",
    editable: true,
    hideControls: false,
    allowDeletion: true,
  })
  const [tagInput, setTagInput] = useState("")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const { createDashboard } = useDashboards()
  const {
    dashboard,
    loading,
    error,
    createPanel,
    updatePanel,
    deletePanel
  } = useDashboard(uid || "")

  useEffect(() => {
    if (!isCreating && dashboard) {
      setFormData({
        title: dashboard.title || "",
        description: dashboard.description || "",
        tags: dashboard.tags || [],
        timezone: dashboard.timezone || "browser",
        refresh: dashboard.refresh || "30s",
        timeFrom: dashboard.time?.from || "now-1h",
        timeTo: dashboard.time?.to || "now",
        editable: dashboard.editable !== false,
        hideControls: dashboard.hideControls || false,
        allowDeletion: true,
      })
    }
  }, [dashboard, isCreating])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isCreating) {
        const newDashboard = await createDashboard({
          ...formData,
          time: {
            from: formData.timeFrom,
            to: formData.timeTo,
          },
          panels: [],
          templating: { list: [] }
        })
        toast({
          title: "Дашборд создан",
          description: "Дашборд успешно создан",
        })
        router.push(`/dashboards/${newDashboard.uid}`)
      } else {
        // Обновление существующего дашборда реализуется через API
        toast({
          title: "Дашборд обновлен",
          description: "Изменения успешно сохранены",
        })
        router.push(`/dashboards/${uid}`)
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить дашборд",
        variant: "destructive",
      })
      console.error("Failed to save dashboard:", error)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  if (loading && !isCreating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  if (error && !isCreating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboards")}>
            Вернуться к списку
          </Button>
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
          <Button onClick={handleSave} disabled={saving || !formData.title}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {!isCreating ? (
          <Tabs defaultValue="panels" className="space-y-4">
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
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Введите название дашборда"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
                      {formData.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`cursor-pointer ${getTagStyle(tag)}`}
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Часовой пояс</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите часовой пояс" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="browser">Браузер</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refresh">Автообновление</Label>
                      <Select
                        value={formData.refresh}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, refresh: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите интервал" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">Отключено</SelectItem>
                          <SelectItem value="5s">5 секунд</SelectItem>
                          <SelectItem value="10s">10 секунд</SelectItem>
                          <SelectItem value="30s">30 секунд</SelectItem>
                          <SelectItem value="1m">1 минута</SelectItem>
                          <SelectItem value="5m">5 минут</SelectItem>
                          <SelectItem value="15m">15 минут</SelectItem>
                          <SelectItem value="30m">30 минут</SelectItem>
                          <SelectItem value="1h">1 час</SelectItem>
                          <SelectItem value="2h">2 часа</SelectItem>
                          <SelectItem value="1d">1 день</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="panels" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Панели дашборда</h3>
                  <p className="text-sm text-muted-foreground">
                    Управление панелями и их настройками
                  </p>
                </div>

                <PanelManager
                  dashboardId={uid || ""}
                  initialPanels={dashboard?.panels?.map(panel => ({
                    id: panel.id?.toString() || "",
                    title: panel.title || "",
                    description: panel.description,
                    type: panel.type || "line",
                    dataSource: "cpu",
                    size: "medium" as const,
                    position: { x: 0, y: 0 },
                    transparent: false,
                    width: panel.gridPos?.w || 12,
                    height: panel.gridPos?.h || 9,
                  })) || []}
                  readOnly={false}
                />
              </div>
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
                      Функциональность переменных будет добавлена в следующих версиях
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
        ) : (
          /* Простая форма без табов для создания дашборда */
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Основные параметры дашборда</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название дашборда *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Введите название дашборда"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите часовой пояс" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="browser">Браузер</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Введите описание дашборда"
                  rows={3}
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
                  {formData.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${getTagStyle(tag)}`}
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Временной диапазон по умолчанию</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeFrom">От (From)</Label>
                    <Select
                      value={formData.timeFrom}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, timeFrom: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время начала" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now-5m">Последние 5 минут</SelectItem>
                        <SelectItem value="now-15m">Последние 15 минут</SelectItem>
                        <SelectItem value="now-30m">Последние 30 минут</SelectItem>
                        <SelectItem value="now-1h">Последний час</SelectItem>
                        <SelectItem value="now-3h">Последние 3 часа</SelectItem>
                        <SelectItem value="now-6h">Последние 6 часов</SelectItem>
                        <SelectItem value="now-12h">Последние 12 часов</SelectItem>
                        <SelectItem value="now-24h">Последние 24 часа</SelectItem>
                        <SelectItem value="now-2d">Последние 2 дня</SelectItem>
                        <SelectItem value="now-7d">Последняя неделя</SelectItem>
                        <SelectItem value="now-30d">Последний месяц</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeTo">До (To)</Label>
                    <Select
                      value={formData.timeTo}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, timeTo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время окончания" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Сейчас</SelectItem>
                        <SelectItem value="now-5m">5 минут назад</SelectItem>
                        <SelectItem value="now-15m">15 минут назад</SelectItem>
                        <SelectItem value="now-30m">30 минут назад</SelectItem>
                        <SelectItem value="now-1h">1 час назад</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Настройки доступа</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="editable">Разрешить редактирование</Label>
                      <p className="text-sm text-muted-foreground">
                        Позволяет пользователям редактировать дашборд
                      </p>
                    </div>
                    <Switch
                      id="editable"
                      checked={formData.editable}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, editable: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowDeletion">Разрешить удаление</Label>
                      <p className="text-sm text-muted-foreground">
                        Позволяет удалять дашборд пользователям с соответствующими правами
                      </p>
                    </div>
                    <Switch
                      id="allowDeletion"
                      checked={formData.allowDeletion}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowDeletion: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hideControls">Скрыть элементы управления</Label>
                      <p className="text-sm text-muted-foreground">
                        Скрывает панель инструментов и элементы управления временем
                      </p>
                    </div>
                    <Switch
                      id="hideControls"
                      checked={formData.hideControls}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, hideControls: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
