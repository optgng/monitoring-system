"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
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

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoadingProfile(true)
        const response = await fetch("/api/user/profile")

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()

        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.attributes?.phone?.[0] || "",
          position: data.attributes?.position?.[0] || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session, toast])

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
            position: [profile.position],
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
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
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
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
        const data = await response.json()
        throw new Error(data.error || "Failed to update password")
      }

      // Reset password fields
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle notification settings update
  const handleNotificationSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // In a real application, you would save these settings to your backend
    toast({
      title: "Success",
      description: "Notification settings updated successfully",
    })
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
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt="Аватар" />
                    <AvatarFallback>
                      {profile.firstName && profile.lastName ? `${profile.firstName[0]}${profile.lastName[0]}` : "АД"}
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">
                    Изменить аватар
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={isLoadingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      disabled={isLoadingProfile}
                    />
                  </div>
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
