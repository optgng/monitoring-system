"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, AlertCircle, Info, CheckCircle2, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AlertsPage() {
  const [selectedTab, setSelectedTab] = useState("all")

  const alerts = [
    {
      id: 1,
      title: "Высокая нагрузка CPU",
      device: "DB-01",
      description: "CPU использование > 90% в течение 15 минут",
      severity: "critical",
      status: "active",
      time: "10 минут назад",
    },
    {
      id: 2,
      title: "Низкое свободное место на диске",
      device: "Web-02",
      description: "Свободно менее 10% дискового пространства",
      severity: "warning",
      status: "active",
      time: "25 минут назад",
    },
    {
      id: 3,
      title: "Перезагрузка сервиса",
      device: "API Gateway",
      description: "Сервис был автоматически перезапущен",
      severity: "info",
      status: "resolved",
      time: "1 час назад",
    },
    {
      id: 4,
      title: "Высокая задержка сети",
      device: "Network",
      description: "Задержка между DC1 и DC2 превышает 100ms",
      severity: "warning",
      status: "active",
      time: "2 часа назад",
    },
    {
      id: 5,
      title: "Недоступен сервис",
      device: "Auth Service",
      description: "Сервис недоступен - проверка работоспособности не пройдена",
      severity: "critical",
      status: "active",
      time: "3 часа назад",
    },
    {
      id: 6,
      title: "Ошибки в логах",
      device: "Web-01",
      description: "Обнаружено более 10 ошибок в минуту",
      severity: "warning",
      status: "resolved",
      time: "4 часа назад",
    },
    {
      id: 7,
      title: "Высокая нагрузка на базу данных",
      device: "DB-02",
      description: "Количество запросов превышает 1000 в секунду",
      severity: "warning",
      status: "active",
      time: "5 часов назад",
    },
    {
      id: 8,
      title: "Обновление системы",
      device: "System",
      description: "Плановое обновление системы завершено успешно",
      severity: "info",
      status: "resolved",
      time: "1 день назад",
    },
  ]

  const filteredAlerts =
    selectedTab === "all"
      ? alerts
      : selectedTab === "active"
        ? alerts.filter((alert) => alert.status === "active")
        : alerts.filter((alert) => alert.status === "resolved")

  const getAlertIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusIcon = (status) => {
    return status === "resolved" ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-yellow-500" />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Оповещения</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по важности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="critical">Критические</SelectItem>
              <SelectItem value="warning">Предупреждения</SelectItem>
              <SelectItem value="info">Информационные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Поиск оповещений..." className="pl-8 w-full" />
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="resolved">Решенные</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Все оповещения</CardTitle>
              <CardDescription>Список всех оповещений системы</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Важность</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Устройство</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.severity)}
                          {alert.severity === "critical" ? (
                            <Badge variant="destructive">Критический</Badge>
                          ) : alert.severity === "warning" ? (
                            <Badge>Предупреждение</Badge>
                          ) : (
                            <Badge variant="secondary">Информация</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>{alert.device}</TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          {alert.status === "active" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Активно
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Решено
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{alert.time}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Активные оповещения</CardTitle>
              <CardDescription>Список активных оповещений, требующих внимания</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Важность</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Устройство</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.severity)}
                          {alert.severity === "critical" ? (
                            <Badge variant="destructive">Критический</Badge>
                          ) : alert.severity === "warning" ? (
                            <Badge>Предупреждение</Badge>
                          ) : (
                            <Badge variant="secondary">Информация</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>{alert.device}</TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          {alert.status === "active" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Активно
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Решено
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{alert.time}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Решенные оповещения</CardTitle>
              <CardDescription>Список решенных оповещений</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Важность</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Устройство</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.severity)}
                          {alert.severity === "critical" ? (
                            <Badge variant="destructive">Критический</Badge>
                          ) : alert.severity === "warning" ? (
                            <Badge>Предупреждение</Badge>
                          ) : (
                            <Badge variant="secondary">Информация</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>{alert.device}</TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          {alert.status === "active" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Активно
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Решено
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{alert.time}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
