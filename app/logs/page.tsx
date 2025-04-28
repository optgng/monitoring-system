"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, FileWarning, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function LogsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Имитация данных логов
  const logs = [
    {
      id: 1,
      timestamp: "2025-04-28T10:15:23",
      level: "ERROR",
      service: "API Gateway",
      message: "Connection refused: connect to database",
      details: "java.net.ConnectException: Connection refused: connect",
    },
    {
      id: 2,
      timestamp: "2025-04-28T10:14:56",
      level: "WARN",
      service: "Auth Service",
      message: "Too many failed login attempts from IP 192.168.1.45",
      details: "User: unknown, Attempts: 5",
    },
    {
      id: 3,
      timestamp: "2025-04-28T10:12:34",
      level: "ERROR",
      service: "Web Server",
      message: "Failed to process request: /api/users/profile",
      details: "HTTP 500 Internal Server Error",
    },
    {
      id: 4,
      timestamp: "2025-04-28T10:10:12",
      level: "INFO",
      service: "Monitoring Service",
      message: "System check completed successfully",
      details: "All services are operational",
    },
    {
      id: 5,
      timestamp: "2025-04-28T10:05:45",
      level: "WARN",
      service: "Database",
      message: "High CPU usage detected",
      details: "CPU usage: 85%, Threshold: 80%",
    },
    {
      id: 6,
      timestamp: "2025-04-28T10:01:23",
      level: "ERROR",
      service: "Cache Service",
      message: "Failed to connect to Redis server",
      details: "Connection timeout after 5000ms",
    },
    {
      id: 7,
      timestamp: "2025-04-28T09:55:11",
      level: "INFO",
      service: "API Gateway",
      message: "Service restarted successfully",
      details: "Restart triggered by system administrator",
    },
  ]

  const refreshLogs = () => {
    setIsRefreshing(true)
    // Имитация обновления данных
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return format(date, "HH:mm:ss dd.MM.yyyy", { locale: ru })
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return <Badge variant="destructive">ERROR</Badge>
      case "WARN":
        return (
          <Badge variant="default" className="bg-yellow-500">
            WARN
          </Badge>
        )
      case "INFO":
        return <Badge variant="secondary">INFO</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Логи системы</h1>
        <Button onClick={refreshLogs} disabled={isRefreshing}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          Обновить
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Поиск в логах..." className="pl-8 w-full" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Уровень логирования" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уровни</SelectItem>
            <SelectItem value="error">Только ошибки</SelectItem>
            <SelectItem value="warn">Предупреждения и выше</SelectItem>
            <SelectItem value="info">Информационные и выше</SelectItem>
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start">
              <Clock className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Все логи</TabsTrigger>
          <TabsTrigger value="errors">Ошибки</TabsTrigger>
          <TabsTrigger value="warnings">Предупреждения</TabsTrigger>
          <TabsTrigger value="info">Информационные</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Все логи системы</CardTitle>
              <CardDescription>Показаны все уровни логирования за выбранный период</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Сервис</TableHead>
                    <TableHead>Сообщение</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>{getLevelBadge(log.level)}</TableCell>
                      <TableCell>{log.service}</TableCell>
                      <TableCell className="max-w-md truncate" title={log.message}>
                        {log.message}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileWarning className="h-4 w-4" />
                          <span className="sr-only">Создать инцидент</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ошибки</CardTitle>
              <CardDescription>Показаны только ошибки за выбранный период</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Сервис</TableHead>
                    <TableHead>Сообщение</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs
                    .filter((log) => log.level === "ERROR")
                    .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>{getLevelBadge(log.level)}</TableCell>
                        <TableCell>{log.service}</TableCell>
                        <TableCell className="max-w-md truncate" title={log.message}>
                          {log.message}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileWarning className="h-4 w-4" />
                            <span className="sr-only">Создать инцидент</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {/* Аналогично для предупреждений */}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          {/* Аналогично для информационных сообщений */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
