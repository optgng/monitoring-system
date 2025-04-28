"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Mail, MessageSquare } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertModal } from "@/components/ui/alert-modal"

export default function NotificationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<any>(null)

  const rules = [
    {
      id: 1,
      name: "Высокая нагрузка CPU",
      condition: "CPU > 90% в течение 5 минут",
      targets: ["Email", "Telegram"],
      severity: "critical",
      status: "active",
    },
    {
      id: 2,
      name: "Низкое свободное место",
      condition: "Свободное место < 10%",
      targets: ["Email"],
      severity: "warning",
      status: "active",
    },
    {
      id: 3,
      name: "Недоступность сервиса",
      condition: "Сервис недоступен > 1 минуты",
      targets: ["Email", "Telegram", "SMS"],
      severity: "critical",
      status: "active",
    },
    {
      id: 4,
      name: "Высокая задержка сети",
      condition: "Задержка > 100ms в течение 10 минут",
      targets: ["Email"],
      severity: "warning",
      status: "inactive",
    },
    {
      id: 5,
      name: "Ошибки в логах",
      condition: "Более 10 ошибок в минуту",
      targets: ["Email"],
      severity: "info",
      status: "active",
    },
  ]

  const handleEdit = (rule: any) => {
    setSelectedRule(rule)
    setIsEditModalOpen(true)
  }

  const handleDelete = (rule: any) => {
    setSelectedRule(rule)
    setIsDeleteModalOpen(true)
  }

  const onDelete = () => {
    // Здесь будет логика удаления
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Настройка уведомлений</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Создать правило
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Поиск правил..." className="pl-8 w-full" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Правила уведомлений</CardTitle>
          <CardDescription>Настройка правил для отправки уведомлений</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Условие</TableHead>
                <TableHead>Каналы</TableHead>
                <TableHead>Важность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.condition}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rule.targets.includes("Email") && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Mail className="mr-1 h-3 w-3" /> Email
                        </Badge>
                      )}
                      {rule.targets.includes("Telegram") && (
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          <MessageSquare className="mr-1 h-3 w-3" /> Telegram
                        </Badge>
                      )}
                      {rule.targets.includes("SMS") && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          SMS
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rule.severity === "critical" ? (
                      <Badge variant="destructive">Критический</Badge>
                    ) : rule.severity === "warning" ? (
                      <Badge>Предупреждение</Badge>
                    ) : (
                      <Badge variant="secondary">Информация</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Активно
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Неактивно
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Модальное окно создания правила */}
      <Modal
        title="Создать правило уведомления"
        description="Настройте новое правило для отправки уведомлений"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название правила</Label>
            <Input id="name" placeholder="Введите название правила" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Условие</Label>
            <Textarea id="condition" placeholder="Например: CPU > 90% в течение 5 минут" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="severity">Важность</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите уровень важности" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Критический</SelectItem>
                <SelectItem value="warning">Предупреждение</SelectItem>
                <SelectItem value="info">Информация</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Каналы уведомлений</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="telegram" />
                <Label htmlFor="telegram">Telegram</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sms" />
                <Label htmlFor="sms">SMS</Label>
              </div>
            </div>
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>Создать</Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования правила */}
      {selectedRule && (
        <Modal
          title="Редактировать правило уведомления"
          description="Измените настройки правила уведомления"
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Название правила</Label>
              <Input id="edit-name" defaultValue={selectedRule.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Условие</Label>
              <Textarea id="edit-condition" defaultValue={selectedRule.condition} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-severity">Важность</Label>
              <Select defaultValue={selectedRule.severity}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите уровень важности" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Критический</SelectItem>
                  <SelectItem value="warning">Предупреждение</SelectItem>
                  <SelectItem value="info">Информация</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Каналы уведомлений</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-email" defaultChecked={selectedRule.targets.includes("Email")} />
                  <Label htmlFor="edit-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-telegram" defaultChecked={selectedRule.targets.includes("Telegram")} />
                  <Label htmlFor="edit-telegram">Telegram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-sms" defaultChecked={selectedRule.targets.includes("SMS")} />
                  <Label htmlFor="edit-sms">SMS</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Статус</Label>
              <Select defaultValue={selectedRule.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активно</SelectItem>
                  <SelectItem value="inactive">Неактивно</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Сохранить</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модальное окно удаления правила */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
        title="Удалить правило"
        description={`Вы уверены, что хотите удалить правило "${selectedRule?.name}"? Это действие нельзя будет отменить.`}
      />
    </div>
  )
}
