"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Lock, Unlock } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/ui/alert-modal"
import { SearchProvider } from "@/components/search/search-context"
import { SearchInput } from "@/components/search/search-input"
import { useSearch } from "@/components/search/search-context"
import { Input } from "@/components/ui/input"

function UsersContent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const { searchTerm } = useSearch()

  const users = [
    {
      id: 1,
      name: "Иванов Иван",
      email: "ivanov@example.com",
      role: "Администратор",
      status: "active",
      lastLogin: "10 минут назад",
    },
    {
      id: 2,
      name: "Петров Петр",
      email: "petrov@example.com",
      role: "Руководитель",
      status: "active",
      lastLogin: "2 часа назад",
    },
    {
      id: 3,
      name: "Сидоров Алексей",
      email: "sidorov@example.com",
      role: "Специалист технической поддержки",
      status: "active",
      lastLogin: "1 день назад",
    },
    {
      id: 4,
      name: "Смирнова Ольга",
      email: "smirnova@example.com",
      role: "Руководитель",
      status: "active",
      lastLogin: "5 часов назад",
    },
    {
      id: 5,
      name: "Козлов Дмитрий",
      email: "kozlov@example.com",
      role: "Специалист технической поддержки",
      status: "blocked",
      lastLogin: "7 дней назад",
    },
  ]

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true

    const search = searchTerm.toLowerCase()
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search) ||
      user.status.toLowerCase().includes(search)
    )
  })

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleBlock = (user: any) => {
    setSelectedUser(user)
    setIsBlockModalOpen(true)
  }

  const onBlock = () => {
    // Здесь будет логика блокировки/разблокировки
    setIsBlockModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить пользователя
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <SearchInput placeholder="Поиск пользователей..." className="flex-1 max-w-sm" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Пользователи системы</CardTitle>
          <CardDescription>Управление пользователями и их правами доступа</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.status === "active" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Заблокирован
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleBlock(user)}>
                          {user.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "Пользователи не найдены" : "Нет доступных пользователей"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Модальное окно создания пользователя */}
      <Modal
        title="Добавить пользователя"
        description="Создайте нового пользователя системы"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя пользователя</Label>
            <Input id="name" placeholder="Введите имя пользователя" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Введите email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" placeholder="Введите пароль" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Роль</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="manager">Руководитель</SelectItem>
                <SelectItem value="support">Специалист технической поддержки</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>Создать</Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования пользователя */}
      {selectedUser && (
        <Modal
          title="Редактировать пользователя"
          description="Измените данные пользователя"
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя пользователя</Label>
              <Input id="edit-name" defaultValue={selectedUser.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" defaultValue={selectedUser.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Роль</Label>
              <Select
                defaultValue={
                  selectedUser.role === "Администратор"
                    ? "admin"
                    : selectedUser.role === "Руководитель"
                      ? "manager"
                      : "support"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="manager">Руководитель</SelectItem>
                  <SelectItem value="support">Специалист технической поддержки</SelectItem>
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

      {/* Модальное окно блокировки/разблокировки пользователя */}
      <AlertModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={onBlock}
        title={selectedUser?.status === "active" ? "Заблокировать пользователя" : "Разблокировать пользователя"}
        description={
          selectedUser?.status === "active"
            ? `Вы уверены, что хотите заблокировать пользователя "${selectedUser?.name}"?`
            : `Вы уверены, что хотите разблокировать пользователя "${selectedUser?.name}"?`
        }
        confirmText={selectedUser?.status === "active" ? "Заблокировать" : "Разблокировать"}
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <SearchProvider>
      <UsersContent />
    </SearchProvider>
  )
}
