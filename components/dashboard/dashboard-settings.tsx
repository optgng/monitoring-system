"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertModal } from "@/components/ui/alert-modal"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardSettingsProps {
  dashboardId: string | number
  initialData?: {
    title: string
    description: string
    type: string
    isPublic: boolean
    refreshInterval: string
    permissions: string[]
  }
  onSave?: (data: any) => void
  onDelete?: () => void
}

export function DashboardSettings({ dashboardId, initialData, onSave, onDelete }: DashboardSettingsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [settings, setSettings] = useState(
    initialData || {
      title: "",
      description: "",
      type: "custom",
      isPublic: false,
      refreshInterval: "0",
      permissions: [],
    },
  )
  const router = useRouter()

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  // Save settings
  const saveSettings = () => {
    // In a real application, this would save to a database
    onSave?.(settings)
    toast({
      title: "Настройки сохранены",
      description: "Настройки дашборда успешно обновлены",
    })
  }

  // Delete dashboard
  const deleteDashboard = () => {
    // In a real application, this would delete from a database
    onDelete?.()
    setIsDeleteModalOpen(false)
    router.push("/dashboards")
    toast({
      title: "Дашборд удален",
      description: "Дашборд был успешно удален",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Настройки дашборда</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={saveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="data">Данные</TabsTrigger>
          <TabsTrigger value="permissions">Доступ</TabsTrigger>
          <TabsTrigger value="advanced">Дополнительно</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Общие настройки</CardTitle>
              <CardDescription>Основная информация о дашборде</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Введите название дашборда"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Введите описание дашборда"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Тип дашборда</Label>
                <Select value={settings.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип дашборда" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Системный</SelectItem>
                    <SelectItem value="network">Сетевой</SelectItem>
                    <SelectItem value="custom">Пользовательский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Настройки данных</CardTitle>
              <CardDescription>Управление источниками данных и обновлением</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh">Интервал обновления</Label>
                <Select
                  value={settings.refreshInterval}
                  onValueChange={(value) => handleChange("refreshInterval", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите интервал обновления" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Не обновлять автоматически</SelectItem>
                    <SelectItem value="30">Каждые 30 секунд</SelectItem>
                    <SelectItem value="60">Каждую минуту</SelectItem>
                    <SelectItem value="300">Каждые 5 минут</SelectItem>
                    <SelectItem value="600">Каждые 10 минут</SelectItem>
                    <SelectItem value="1800">Каждые 30 минут</SelectItem>
                    <SelectItem value="3600">Каждый час</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Кэширование данных</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cache"
                    checked={true}
                    // onChange={(checked) => handleChange("cache", checked)}
                  />
                  <Label htmlFor="cache">Включить кэширование данных</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Настройки доступа</CardTitle>
              <CardDescription>Управление доступом к дашборду</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Публичный доступ</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={settings.isPublic}
                    onCheckedChange={(checked) => handleChange("isPublic", checked)}
                  />
                  <Label htmlFor="public">Сделать дашборд публичным</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Публичные дашборды доступны всем пользователям без авторизации
                </p>
              </div>

              <div className="space-y-2">
                <Label>Роли с доступом</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="role-admin" checked={true} disabled />
                    <Label htmlFor="role-admin">Администраторы</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="role-manager"
                      checked={true}
                      // onChange={(e) => handleRoleChange("manager", e.target.checked)}
                    />
                    <Label htmlFor="role-manager">Менеджеры</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="role-user"
                      checked={true}
                      // onChange={(e) => handleRoleChange("user", e.target.checked)}
                    />
                    <Label htmlFor="role-user">Пользователи</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Дополнительные настройки</CardTitle>
              <CardDescription>Расширенные настройки дашборда</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Экспорт и импорт</Label>
                <div className="flex gap-2">
                  <Button variant="outline">Экспортировать JSON</Button>
                  <Button variant="outline">Импортировать</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t flex flex-col items-start pt-6">
              <h3 className="text-lg font-medium text-destructive mb-2">Опасная зона</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Удаление дашборда приведет к потере всех связанных с ним данных и настроек. Это действие нельзя будет
                отменить.
              </p>
              <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить дашборд
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteDashboard}
        title="Удалить дашборд"
        description="Вы уверены, что хотите удалить этот дашборд? Это действие нельзя будет отменить."
      />
    </div>
  )
}
