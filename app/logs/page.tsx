"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Clock, AlertTriangle, AlertCircle, Info } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

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

  // Filter logs based on search term, tab, and severity filter
  useEffect(() => {
    let filtered = [...logs]

    // Filter by tab (log level)
    if (selectedTab !== "all") {
      filtered = filtered.filter((log) => {
        if (selectedTab === "errors") return log.level === "ERROR"
        if (selectedTab === "warnings") return log.level === "WARN"
        if (selectedTab === "info") return log.level === "INFO"
        return true
      })
    }

    // Filter by severity if not "all"
    if (severityFilter !== "all") {
      filtered = filtered.filter((log) => {
        if (severityFilter === "error") return log.level === "ERROR"
        if (severityFilter === "warn") return log.level === "WARN" || log.level === "ERROR"
        if (severityFilter === "info") return true // All levels
        return true
      })
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const lowercasedSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(lowercasedSearch) ||
          log.service.toLowerCase().includes(lowercasedSearch) ||
          log.details.toLowerCase().includes(lowercasedSearch),
      )
    }

    setFilteredLogs(filtered)
  }, [searchTerm, selectedTab, severityFilter])

  // Initialize filtered logs with all logs
  useEffect(() => {
    setFilteredLogs(logs)
  }, [])

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

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "WARN":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "INFO":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
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
          <Input
            type="search"
            placeholder="Поиск в логах..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select defaultValue="all" value={severityFilter} onValueChange={setSeverityFilter}>
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

      <Tabs defaultValue="all" className="space-y-4" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">Все логи</TabsTrigger>
          <TabsTrigger value="errors">Ошибки</TabsTrigger>
          <TabsTrigger value="warnings">Предупреждения</TabsTrigger>
          <TabsTrigger value="info">Информационные</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {selectedTab === "all"
                  ? "Все логи системы"
                  : selectedTab === "errors"
                    ? "Ошибки"
                    : selectedTab === "warnings"
                      ? "Предупреждения"
                      : "Информационные сообщения"}
              </CardTitle>
              <CardDescription>
                {selectedTab === "all"
                  ? "Показаны все уровни логирования за выбранный период"
                  : selectedTab === "errors"
                    ? "Показаны только ошибки за выбранный период"
                    : selectedTab === "warnings"
                      ? "Показаны только предупреждения за выбранный период"
                      : "Показаны только информационные сообщения за выбранный период"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Сервис</TableHead>
                    <TableHead>Сообщение</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAlertIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>{log.service}</TableCell>
                        <TableCell className="max-w-md truncate" title={log.message}>
                          {log.message}
                        </TableCell>
                        <TableCell className="max-w-md truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        {searchTerm ? "Логи не найдены" : "Нет доступных логов"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
