"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, ExternalLink, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IncidentsPage() {
  const [selectedTab, setSelectedTab] = useState("all")

  // Имитация данных инцидентов
  const incidents = [
    {
      id: 1,
      title: "Недоступность API Gateway",
      description: "Сервис API Gateway недоступен, что приводит к ошибкам в работе приложения",
      severity: "critical",
      status: "open",
      createdAt: "2025-04-28T10:15:23",
      assignedTo: "Иванов Иван",
      service: "API Gateway",
    },
    {
      id: 2,
      title: "Высокая нагрузка на базу данных",
      description: "Обнаружена высокая нагрузка на базу данных, что приводит к замедлению работы системы",
      severity: "warning",
      status: "in_progress",
      createdAt: "2025-04-27T15:30:45",
      assignedTo: "Петров Петр",
      service: "Database",
    },
    {
      id: 3,
      title: "Ошибки аутентификации",
      description: "Пользователи сообщают о проблемах с входом в систему",
      severity: "warning",
      status: "open",
      createdAt: "2025-04-27T12:10:33",
      assignedTo: "Не назначено",
      service: "Auth Service",
    },
    {
      id: 4,
      title: "Недоступность кэш-сервиса",
      description: "Сервис кэширования недоступен, что приводит к увеличению нагрузки на базу данных",
      severity: "critical",
      status: "resolved",
      createdAt: "2025-04-26T09:45:12",
      assignedTo: "Сидоров Алексей",
      service: "Cache Service",
      resolvedAt: "2025-04-26T14:20:33",
    },
    {
      id: 5,
      title: "Проблемы с производительностью веб-сервера",
      description: "Веб-сервер показывает высокое время отклика",
      severity: "warning",
      status: "resolved",
      createdAt: "2025-04-25T16:30:22",
      assignedTo: "Иванов Иван",
      service: "Web Server",
      resolvedAt: "2025-04-25T18:45:10",
    },
  ]

  const filteredIncidents =
    selectedTab === "all"
      ? incidents
      : selectedTab === "open"
        ? incidents.filter((incident) => incident.status === "open")
        : selectedTab === "in_progress"
          ? incidents.filter((incident) => incident.status === "in_progress")
          : incidents.filter((incident) => incident.status === "resolved")

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Критический</Badge>
      case "warning":
        return <Badge>Предупреждение</Badge>
      case "info":
        return <Badge variant="secondary">Информация</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Открыт
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            В работе
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Решен
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Инциденты</h1>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="mr-2 h-4 w-4" /> Создать инцидент
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Поиск инцидентов..." className="pl-8 w-full" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Важность" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="critical">Критические</SelectItem>
            <SelectItem value="warning">Предупреждения</SelectItem>
            <SelectItem value="info">Информационные</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Сервис" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все сервисы</SelectItem>
            <SelectItem value="api">API Gateway</SelectItem>
            <SelectItem value="auth">Auth Service</SelectItem>
            <SelectItem value="web">Web Server</SelectItem>
            <SelectItem value="db">Database</SelectItem>
            <SelectItem value="cache">Cache Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="open">Открытые</TabsTrigger>
          <TabsTrigger value="in_progress">В работе</TabsTrigger>
          <TabsTrigger value="resolved">Решенные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Все инциденты</CardTitle>
              <CardDescription>Список всех инцидентов в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Сервис</TableHead>
                    <TableHead>Важность</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead>Назначен</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-mono">#{incident.id}</TableCell>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>{incident.service}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>{formatDate(incident.createdAt)}</TableCell>
                      <TableCell>{incident.assignedTo}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/incidents/${incident.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          {incident.status !== "resolved" && (
                            <Button variant="ghost" size="icon">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          {/* Аналогично для открытых инцидентов */}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {/* Аналогично для инцидентов в работе */}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {/* Аналогично для решенных инцидентов */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
