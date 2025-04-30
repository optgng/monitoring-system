import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MessageSquare } from "lucide-react"

export default function ProfilePage() {
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
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>Обновите ваши личные данные и контактную информацию</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt="Аватар" />
                  <AvatarFallback>АД</AvatarFallback>
                </Avatar>
                <Button variant="outline">Изменить аватар</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" defaultValue="Иванов Иван" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="ivanov@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" type="tel" defaultValue="+7 (999) 123-45-67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input id="position" defaultValue="Администратор" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Сохранить изменения</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Изменение пароля</CardTitle>
              <CardDescription>Обновите ваш пароль для повышения безопасности</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтверждение пароля</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Изменить пароль</Button>
            </CardFooter>
          </Card>
          {/* Two-factor authentication section removed */}
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
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
                <Switch defaultChecked />
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
                  <Switch />
                </div>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="telegram-username">Имя пользователя Telegram</Label>
                    <Input id="telegram-username" placeholder="@username" />
                  </div>

                  <div className="space-y-2">
                    <Label>Типы уведомлений</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="telegram-critical" />
                        <Label htmlFor="telegram-critical">Критические оповещения</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="telegram-warnings" />
                        <Label htmlFor="telegram-warnings">Предупреждения</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="telegram-system" />
                        <Label htmlFor="telegram-system">Системные уведомления</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="telegram-reports" />
                        <Label htmlFor="telegram-reports">Отчеты</Label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      Подключить Telegram
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Сохранить настройки</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
