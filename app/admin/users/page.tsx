"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Search, Edit, Lock, UserCheck, UserX, RefreshCw, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"

// Define user type
interface User {
  id: string
  username: string
  firstName?: string
  lastName?: string
  email?: string
  enabled: boolean
  emailVerified: boolean
  createdTimestamp?: number
  roles?: string[]
  phone?: string // Добавлено поле phone
}

// Определяем доступные роли
const AVAILABLE_ROLES = ["admin", "manager", "support"]

export default function UsersPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [availableRoles, setAvailableRoles] = useState<string[]>(AVAILABLE_ROLES)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  // Form states
  const [newUser, setNewUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    phone: "", // Добавлено поле phone
  })

  const [editUser, setEditUser] = useState<User | null>(null)
  const [editUserRole, setEditUserRole] = useState("user")
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [temporaryPassword, setTemporaryPassword] = useState(true)

  // Состояния ошибок для форм
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultModalContent, setResultModalContent] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  })

  // Fetch users
  const fetchUsers = useCallback(async () => {
    // Проверяем, что сессия загружена и пользователь авторизован
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (!session) return

    try {
      setIsLoading(true)
      setFetchError(null)

      console.log("Fetching users data...")
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Fetched users:", data)
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setFetchError((error as Error).message || "Не удалось загрузить список пользователей")
      toast({
        title: "Ошибка",
        description: (error as Error).message || "Не удалось загрузить список пользователей",
        variant: "destructive",
      })
      // Set empty arrays to prevent undefined errors
      setUsers([])
      setFilteredUsers([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [session, toast, status, router])

  // Load data when session is available
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        (user.firstName && user.firstName.toLowerCase().includes(query)) ||
        (user.lastName && user.lastName.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)),
    )

    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Handle refresh users
  const handleRefreshUsers = () => {
    setIsRefreshing(true)
    fetchUsers()
  }

  // Простая валидация email и телефона
  const validateUserForm = (user: typeof newUser) => {
    const errors: { [key: string]: string } = {}
    if (!user.username.trim()) errors.username = "Имя пользователя обязательно"
    if (!user.firstName.trim()) errors.firstName = "Имя обязательно"
    if (!user.lastName.trim()) errors.lastName = "Фамилия обязательна"
    if (!user.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/)) errors.email = "Некорректный email"
    if (user.phone && !user.phone.match(/^\+?\d{7,15}$/)) errors.phone = "Некорректный телефон"
    if (!user.password && !editDialogOpen) errors.password = "Пароль обязателен"
    return errors
  }

  // Функция для парсинга ошибок Keycloak
  function parseKeycloakError(errorData: any): string {
    if (!errorData) return "Неизвестная ошибка"
    if (typeof errorData === "string") return errorData
    if (errorData.errorMessage) {
      // Частые ошибки Keycloak
      if (errorData.errorMessage === "User exists with same email") {
        return "Пользователь с таким email уже существует."
      }
      if (errorData.errorMessage === "User exists with same username") {
        return "Пользователь с таким именем уже существует."
      }
      if (errorData.errorMessage === "error-user-attribute-required" && errorData.params?.[0]) {
        return `Поле "${errorData.params[0]}" обязательно для заполнения.`
      }
      return errorData.errorMessage
    }
    if (errorData.field && errorData.errorMessage) {
      return `Ошибка поля "${errorData.field}": ${errorData.errorMessage}`
    }
    if (errorData.error_description) return errorData.error_description
    if (errorData.error) return errorData.error
    return "Неизвестная ошибка"
  }

  // Handle create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    const errors = validateUserForm(newUser)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    try {
      setIsCreatingUser(true)
      const role = AVAILABLE_ROLES.includes(newUser.role) ? newUser.role : AVAILABLE_ROLES[0]

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          password: newUser.password,
          roles: [role],
          attributes: {
            phoneNumber: newUser.phone,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const errorMsg = parseKeycloakError(data)
        setResultModalContent({ title: "Ошибка", description: errorMsg })
        setShowResultModal(true)
        return
      }

      setNewUser({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        phone: "",
      })

      setResultModalContent({ title: "Успех", description: "Пользователь успешно создан" })
      setShowResultModal(true)
      setCreateDialogOpen(false)
      fetchUsers()
    } finally {
      setIsCreatingUser(false)
    }
  }

  // Handle edit user
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    if (!editUser) {
      setResultModalContent({ title: "Ошибка", description: "Пользователь не выбран" })
      setShowResultModal(true)
      return
    }

    const errors = validateUserForm({ ...editUser, password: "" })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    try {
      setIsUpdatingUser(true)
      const role = AVAILABLE_ROLES.includes(editUserRole) ? editUserRole : AVAILABLE_ROLES[0]

      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editUser.firstName,
          lastName: editUser.lastName,
          email: editUser.email,
          enabled: editUser.enabled,
          roles: [role],
          attributes: {
            phoneNumber: editUser.phone,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const errorMsg = parseKeycloakError(data)
        setResultModalContent({ title: "Ошибка", description: errorMsg })
        setShowResultModal(true)
        return
      }

      setResultModalContent({ title: "Успех", description: "Пользователь успешно обновлен" })
      setShowResultModal(true)
      setEditDialogOpen(false)
      fetchUsers()
    } finally {
      setIsUpdatingUser(false)
    }
  }

  // Handle reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetPasswordUser) return

    try {
      const response = await fetch(`/api/admin/users/${resetPasswordUser.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
          temporary: temporaryPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось сбросить пароль",
          variant: "destructive",
        })
        throw new Error(data.error || "Failed to reset password")
      }

      // Reset form
      setNewPassword("")
      setTemporaryPassword(true)

      // Close dialog
      setResetPasswordDialogOpen(false)

      toast({
        title: "Успех",
        description: "Пароль успешно сброшен",
      })
    } catch (error) {
      // toast уже вызван выше, здесь можно не дублировать
    }
  }

  // Handle toggle user status
  const handleToggleUserStatus = async (userId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !enabled,
        }),
      })

      if (!response.ok) {
        setResultModalContent({ title: "Ошибка", description: "Не удалось изменить статус пользователя" })
        setShowResultModal(true)
        return
      }

      // Update users list
      setUsers(users.map((user) => (user.id === userId ? { ...user, enabled: !enabled } : user)))

      setResultModalContent({
        title: "Успех",
        description: `Пользователь успешно ${!enabled ? "разблокирован" : "заблокирован"}`,
      })
      setShowResultModal(true)
    } catch (error) {
      setResultModalContent({ title: "Ошибка", description: "Не удалось изменить статус пользователя" })
      setShowResultModal(true)
    }
  }

  // Get user role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "support":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Показываем состояние загрузки сессии
  if (status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Загрузка данных пользователя...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Показываем ошибку, если пользователь не авторизован
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Show error state if fetch failed
  if (fetchError && !isLoading && !isRefreshing) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <h2 className="text-xl font-semibold text-destructive">Ошибка загрузки пользователей</h2>
            <p className="text-muted-foreground">{fetchError}</p>
            <Button onClick={handleRefreshUsers} disabled={isRefreshing}>
              {isRefreshing ? "Обновление..." : "Повторить попытку"}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Добавить функцию для открытия диалога редактирования пользователя
  const handleEditDialogOpen = (user: User) => {
    setEditUser({
      ...user,
      phone: user.phone || user.attributes?.phoneNumber?.[0] || user.attributes?.phone?.[0] || "",
    })
    setEditUserRole(user.roles?.[0] || "user")
    setEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Управление пользователями</h1>
      <p className="text-muted-foreground">Создание, редактирование и управление пользователями системы</p>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Пользователи</CardTitle>
            <CardDescription>Список всех пользователей системы</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск пользователей..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleRefreshUsers} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Обновить</span>
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить пользователя
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateUser}>
                  <DialogHeader>
                    <DialogTitle>Добавить пользователя</DialogTitle>
                    <DialogDescription>Создайте нового пользователя системы</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                          id="firstName"
                          placeholder="Введите имя"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                          className={formErrors.firstName ? "border-red-500" : ""}
                        />
                        {formErrors.firstName && <span className="text-xs text-red-500">{formErrors.firstName}</span>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                          id="lastName"
                          placeholder="Введите фамилию"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                          className={formErrors.lastName ? "border-red-500" : ""}
                        />
                        {formErrors.lastName && <span className="text-xs text-red-500">{formErrors.lastName}</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Имя пользователя</Label>
                      <Input
                        id="username"
                        placeholder="Введите имя пользователя"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                        className={formErrors.username ? "border-red-500" : ""}
                      />
                      {formErrors.username && <span className="text-xs text-red-500">{formErrors.username}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Введите email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                      {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Введите пароль"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                        className={formErrors.password ? "border-red-500" : ""}
                      />
                      {formErrors.password && <span className="text-xs text-red-500">{formErrors.password}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        placeholder="Введите телефон"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        className={formErrors.phone ? "border-red-500" : ""}
                      />
                      {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Роль</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreatingUser}>
                      {isCreatingUser ? "Создание..." : "Создать пользователя"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя пользователя</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Роли</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {searchQuery ? "Пользователи не найдены" : "Нет доступных пользователей"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || ""}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role} className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">Нет ролей</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                      >
                        {user.enabled ? "Активен" : "Заблокирован"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditDialogOpen(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setResetPasswordUser(user)
                            setResetPasswordDialogOpen(true)
                          }}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleUserStatus(user.id, user.enabled)}
                        >
                          {user.enabled ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          {editUser && (
            <form onSubmit={handleEditUser}>
              <DialogHeader>
                <DialogTitle>Редактировать пользователя</DialogTitle>
                <DialogDescription>Обновите информацию о пользователе</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">Имя</Label>
                    <Input
                      id="edit-firstName"
                      placeholder="Введите имя"
                      value={editUser.firstName || ""}
                      onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                      className={formErrors.firstName ? "border-red-500" : ""}
                    />
                    {formErrors.firstName && <span className="text-xs text-red-500">{formErrors.firstName}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Фамилия</Label>
                    <Input
                      id="edit-lastName"
                      placeholder="Введите фамилию"
                      value={editUser.lastName || ""}
                      onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                      className={formErrors.lastName ? "border-red-500" : ""}
                    />
                    {formErrors.lastName && <span className="text-xs text-red-500">{formErrors.lastName}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="Введите email"
                    value={editUser.email || ""}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Телефон</Label>
                  <Input
                    id="edit-phone"
                    placeholder="Введите телефон"
                    value={editUser.phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    className={formErrors.phone ? "border-red-500" : ""}
                  />
                  {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Роль</Label>
                  <Select value={editUserRole} onValueChange={setEditUserRole}>
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-enabled"
                    checked={editUser.enabled}
                    onCheckedChange={(checked) => setEditUser({ ...editUser, enabled: checked })}
                  />
                  <Label htmlFor="edit-enabled">Активен</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUpdatingUser}>
                  {isUpdatingUser ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          {resetPasswordUser && (
            <form onSubmit={handleResetPassword}>
              <DialogHeader>
                <DialogTitle>Сбросить пароль</DialogTitle>
                <DialogDescription>
                  Установите новый пароль для пользователя {resetPasswordUser.username}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Введите новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="temporary-password" checked={temporaryPassword} onCheckedChange={setTemporaryPassword} />
                  <Label htmlFor="temporary-password">
                    Временный пароль (пользователь должен изменить при следующем входе)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Сбросить пароль</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно результата */}
      <Modal
        title={resultModalContent.title}
        description={resultModalContent.description}
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
      >
        <div className="flex justify-end">
          <Button onClick={() => setShowResultModal(false)}>OK</Button>
        </div>
      </Modal>
    </div>
  )
}
