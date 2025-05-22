"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Modal } from "@/components/ui/modal"

// Тип для данных профиля
interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

// Тип для пропсов компонента
interface ProfileClientProps {
  initialData?: ProfileData
}

export function ProfileClient({ initialData }: ProfileClientProps) {
  // Используем useRef для отслеживания монтирования компонента
  const isMounted = useRef(false)
  const fetchStarted = useRef(false)
  const abortController = useRef<AbortController | null>(null)

  const { toast } = useToast()

  // Profile state - используем initialData, если они есть
  const [profile, setProfile] = useState<ProfileData>(
    initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  )

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(!initialData) // Не показываем загрузку, если есть initialData
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    telegram: false,
    telegramUsername: "",
    telegramNotifications: {
      critical: true,
      warnings: true,
      system: false,
      reports: false,
    },
  })

  // Форма ошибок
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  // Состояние модального окна результата
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultModalContent, setResultModalContent] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  })

  // Функция для загрузки профиля - определена вне useEffect
  async function loadProfile() {
    // Если загрузка уже началась или есть initialData, не запускаем повторно
    if (fetchStarted.current || initialData) return

    // Если компонент размонтирован, не продолжаем
    if (!isMounted.current) return

    // Устанавливаем флаг начала загрузки
    fetchStarted.current = true

    // Создаем новый AbortController для возможности отмены запроса
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()

    try {
      setIsLoadingProfile(true)
      setFetchError(null)

      console.log("Fetching profile data from client...")

      // Добавляем случайный параметр для предотвращения кэширования
      const timestamp = Date.now()
      const response = await fetch(`/api/user/profile?_=${timestamp}`, {
        signal: abortController.current.signal,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Profile data received:", data)

      // Проверяем, что компонент все еще смонтирован
      if (!isMounted.current) return

      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.attributes?.phone?.[0] || "", // Проверка на наличие attributes
      })
    } catch (error) {
      // Игнорируем ошибки отмены запроса
      if ((error as Error).name === "AbortError") {
        console.log("Fetch aborted")
        return
      }

      // Проверяем, что компонент все еще смонтирован
      if (!isMounted.current) return

      console.error("Error fetching profile:", error)
      setFetchError((error as Error).message || "Не удалось загрузить данные профиля")
      toast({
        title: "Ошибка",
        description: (error as Error).message || "Не удалось загрузить данные профиля",
        variant: "destructive",
      })
    } finally {
      // Проверяем, что компонент все еще смонтирован
      if (isMounted.current) {
        setIsLoadingProfile(false)
      }
    }
  }

  // Эффект для отслеживания монтирования/размонтирования компонента
  useEffect(() => {
    isMounted.current = true

    // Если нет initialData, загружаем данные
    if (!initialData) {
      loadProfile()
    }

    return () => {
      isMounted.current = false
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [initialData])

  const validateProfile = (profile: ProfileData) => {
    const errors: { [key: string]: string } = {}
    if (!profile.firstName.trim()) errors.firstName = "Имя обязательно"
    if (!profile.lastName.trim()) errors.lastName = "Фамилия обязательна"
    if (!profile.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/)) errors.email = "Некорректный email"
    if (profile.phone && !profile.phone.match(/^\+?\d{7,15}$/)) errors.phone = "Некорректный телефон"
    return errors
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    const errors = validateProfile(profile)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    try {
      setIsLoading(true)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          attributes: {
            phoneNumber: profile.phone,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = parseKeycloakError(errorData)
        setResultModalContent({ title: "Ошибка", description: errorMsg })
        setShowResultModal(true)
        return
      }

      setResultModalContent({ title: "Успех", description: "Профиль успешно обновлен" })
      setShowResultModal(true)
      await loadProfile()
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    if (passwords.newPassword !== passwords.confirmPassword) {
      setFormErrors({ confirmPassword: "Пароли не совпадают" })
      return
    }
    if (passwords.newPassword.length < 8) {
      setFormErrors({ newPassword: "Пароль должен содержать не менее 8 символов" })
      return
    }
    try {
      setIsUpdatingPassword(true)

      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const errorMsg = parseKeycloakError(data)
        setResultModalContent({ title: "Ошибка", description: errorMsg })
        setShowResultModal(true)
        return
      }

      setResultModalContent({ title: "Успех", description: "Пароль успешно обновлен" })
      setShowResultModal(true)
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle notification settings update
  const handleNotificationSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // В реальном приложении здесь был бы код для сохранения настроек уведомлений
    toast({
      title: "Успех",
      description: "Настройки уведомлений успешно обновлены",
    })
  }

  // Retry loading profile data
  const handleRetry = () => {
    fetchStarted.current = false
    loadProfile()
  }

  // Show error state if fetch failed
  if (fetchError && !isLoadingProfile) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Профиль пользователя</h1>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <h2 className="text-xl font-semibold text-destructive">Ошибка загрузки профиля</h2>
            <p className="text-muted-foreground">{fetchError}</p>
            <Button onClick={handleRetry}>Повторить попытку</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Профиль пользователя</h1>
      <p className="text-muted-foreground">Управление личными данными и настройками аккаунта</p>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Личные данные</CardTitle>
                <CardDescription>Обновите ваши личные данные и контактную информацию</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoadingProfile ? (
                    <>
                      <div className="space-y-2">
                        <Label>Имя</Label>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Label>Фамилия</Label>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                          id="firstName"
                          placeholder="Введите имя"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className={formErrors.firstName ? "border-red-500" : ""}
                        />
                        {formErrors.firstName && <span className="text-xs text-red-500">{formErrors.firstName}</span>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                          id="lastName"
                          placeholder="Введите фамилию"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className={formErrors.lastName ? "border-red-500" : ""}
                        />
                        {formErrors.lastName && <span className="text-xs text-red-500">{formErrors.lastName}</span>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Введите email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className={formErrors.email ? "border-red-500" : ""}
                        />
                        {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Введите номер телефона"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className={formErrors.phone ? "border-red-500" : ""}
                        />
                        {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading || isLoadingProfile}>
                  {isLoading ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <form onSubmit={handlePasswordUpdate}>
              <CardHeader>
                <CardTitle>Изменение пароля</CardTitle>
                <CardDescription>Обновите ваш пароль для повышения безопасности</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Введите текущий пароль"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Введите новый пароль"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className={formErrors.newPassword ? "border-red-500" : ""}
                  />
                  {formErrors.newPassword && <span className="text-xs text-red-500">{formErrors.newPassword}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтверждение пароля</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Подтвердите новый пароль"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className={formErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  {formErrors.confirmPassword && (
                    <span className="text-xs text-red-500">{formErrors.confirmPassword}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? "Изменение..." : "Изменить пароль"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <form onSubmit={handleNotificationSettingsUpdate}>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>Настройте способы получения уведомлений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email-уведомления</p>
                    <p className="text-sm text-muted-foreground">Получать уведомления на email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email: checked })}
                  />
                </div>

                {/* Telegram notifications */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Telegram-уведомления</p>
                        <p className="text-sm text-muted-foreground">Получать уведомления в Telegram</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.telegram}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, telegram: checked })
                      }
                    />
                  </div>

                  {notificationSettings.telegram && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="telegram-username">Имя пользователя Telegram</Label>
                        <Input
                          id="telegram-username"
                          placeholder="@username"
                          value={notificationSettings.telegramUsername}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              telegramUsername: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Типы уведомлений</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="telegram-critical"
                              checked={notificationSettings.telegramNotifications.critical}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  telegramNotifications: {
                                    ...notificationSettings.telegramNotifications,
                                    critical: checked,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="telegram-critical">Критические оповещения</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="telegram-warnings"
                              checked={notificationSettings.telegramNotifications.warnings}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  telegramNotifications: {
                                    ...notificationSettings.telegramNotifications,
                                    warnings: checked,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="telegram-warnings">Предупреждения</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="telegram-system"
                              checked={notificationSettings.telegramNotifications.system}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  telegramNotifications: {
                                    ...notificationSettings.telegramNotifications,
                                    system: checked,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="telegram-system">Системные уведомления</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="telegram-reports"
                              checked={notificationSettings.telegramNotifications.reports}
                              onCheckedChange={(checked) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  telegramNotifications: {
                                    ...notificationSettings.telegramNotifications,
                                    reports: checked,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="telegram-reports">Отчеты</Label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button variant="outline" type="button" className="w-full">
                          Подключить Telegram
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Сохранить настройки</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

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

function parseKeycloakError(errorData: any): string {
  if (!errorData) return "Неизвестная ошибка"
  if (typeof errorData === "string") return errorData
  if (errorData.errorMessage) {
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
