"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, FileText, MessageSquare, Clock, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params.id
  const [status, setStatus] = useState("open")

  // Имитация данных инцидента
  const incident = {
    id: incidentId,
    title: "Недоступность API Gateway",
    description:
      "Сервис API Gateway недоступен, что приводит к ошибкам в работе приложения. Пользователи сообщают о невозможности выполнить вход в систему и получить доступ к основным функциям.",
    severity: "critical",
    status: "open",
    createdAt: "2025-04-28T10:15:23",
    assignedTo: "Иванов Иван",
    service: "API Gateway",
    logs: [
      {
        timestamp: "2025-04-28T10:14:56",
        level: "ERROR",
        message: "Connection refused: connect to API Gateway",
      },
      {
        timestamp: "2025-04-28T10:14:50",
        level: "ERROR",
        message: "Failed to establish connection with API Gateway",
      },
      {
        timestamp: "2025-04-28T10:14:45",
        level: "WARN",
        message: "API Gateway response time exceeds threshold: 5000ms",
      },
    ],
    comments: [
      {
        id: 1,
        author: "Иванов Иван",
        timestamp: "2025-04-28T10:30:45",
        content: "Начал исследование проблемы. Предварительно, проблема связана с сетевой доступностью.",
      },
      {
        id: 2,
        author: "Петров Петр",
        timestamp: "2025-04-28T10:45:12",
        content: "Проверил логи сетевого оборудования, обнаружил проблему с маршрутизацией.",
      },
    ],
  }

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

  const handleStatusChange = (value: string) => {
    setStatus(value)
  }

  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Здесь будет логика добавления комментария
  }

  const handleResolve = () => {
    // Здесь будет логика решения инцидента
    router.push("/incidents")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/incidents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Инцидент #{incidentId}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{incident.title}</CardTitle>
                  <CardDescription>
                    Создан {formatDate(incident.createdAt)} • {incident.service}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{incident.description}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="comments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="comments">Комментарии</TabsTrigger>
              <TabsTrigger value="logs">Логи</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Комментарии</CardTitle>
                  <CardDescription>История обсуждения инцидента</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incident.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 rounded-lg border">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {comment.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleAddComment}>
                    <div className="space-y-2">
                      <Textarea placeholder="Добавьте комментарий..." rows={3} />
                      <div className="flex justify-end">
                        <Button type="submit">Отправить</Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Связанные логи</CardTitle>
                  <CardDescription>Логи, связанные с инцидентом</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm">
                    {incident.logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${
                          log.level === "ERROR"
                            ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : log.level === "WARN"
                              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">[{log.level}]</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="mt-1">{log.message}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление инцидентом</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Создан
                </div>
                <p className="text-sm">{formatDate(incident.createdAt)}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Назначен
                </div>
                <Select defaultValue="ivanov">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите исполнителя" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не назначено</SelectItem>
                    <SelectItem value="ivanov">Иванов Иван</SelectItem>
                    <SelectItem value="petrov">Петров Петр</SelectItem>
                    <SelectItem value="sidorov">Сидоров Алексей</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Статус
                </div>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Открыт</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="resolved">Решен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleResolve}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Решить инцидент
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Сформировать отчет
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Связанные элементы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Диагностика системы</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/diagnostics">Просмотр</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Логи системы</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/logs">Просмотр</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
