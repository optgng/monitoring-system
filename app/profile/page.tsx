"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
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

  // Fetch user profile - using useCallback to prevent infinite loops
  const fetchProfile = useCallback(async () => {
    // Проверяем, что сессия загружена и пользователь авторизован
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (!session?.user?.id) {
      setIsLoadingProfile(false)
      return
    }

    try {
      setIsLoadingProfile(true)
      setFetchError(null)

      console.log("Fetching profile data...")
      const response = await fetch("/api/user/profile")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Profile data received:", data)

      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        // Correctly map the phone attribute from Keycloak
        phone: data.attributes?.phone?.[0] || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      setFetchError((error as Error).message || "Не удалось загрузить данные профиля")
      toast({
        title: "Ошибка",
        description: (error as Error).message || "Не удалось загрузить данные профиля",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }, [session?.user?.id, toast, status, router])

  // Load profile data when session is available
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

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
            phone: [profile.phone],
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update profile")
      }

      // Update the session to reflect the changes
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
        },
      })

      // Force a refresh to update the header
      router.refresh()

      toast({
        title: "Успех",
        description: "Профиль успешно обновлен",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Ошибка",
        description: (error as Error).message || "Не удалось обновить профиль",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      })
      return
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать не менее 8 символов",
        variant: "destructive",
      })
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
        throw new Error(data.error || "Failed to update password")
      }

      // Reset password fields
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Успех",
        description: "Пароль успешно обновлен",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Ошибка",
        description: (error as Error).message || "Не удалось обновить пароль",
        variant: "destructive",
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
    fetchProfile()
  }

  // Показываем состояние загрузки сессии
  if (status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Профиль пользователя</h1>
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
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
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
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтверждение пароля</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  />
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
    </div>
  )
}
