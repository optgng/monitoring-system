"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Database,
  Globe,
  HardDrive,
  Cpu,
  MemoryStickIcon as Memory,
  Network,
  Loader2,
  FileWarning,
  Shield,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DiagnosticsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const router = useRouter()

  const runDiagnostics = () => {
    setIsRunning(true)
    setProgress(0)
    setDiagnosticResults(null)

    // Имитация процесса диагностики
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          // Имитация результатов диагностики
          setDiagnosticResults({
            status: "completed",
            timestamp: new Date().toISOString(),
            services: [
              { name: "API Gateway", status: "operational", responseTime: 45 },
              { name: "Auth Service", status: "operational", responseTime: 32 },
              { name: "Web Server", status: "degraded", responseTime: 320, issue: "High response time" },
              { name: "Database", status: "operational", responseTime: 78 },
              { name: "Cache Service", status: "critical", responseTime: 0, issue: "Connection refused" },
            ],
            resources: [
              { name: "CPU", status: "operational", usage: 45 },
              { name: "Memory", status: "warning", usage: 82 },
              { name: "Disk", status: "operational", usage: 68 },
              { name: "Network", status: "operational", usage: 35 },
            ],
            summary: {
              operational: 7,
              warning: 1,
              critical: 1,
              total: 9,
            },
          })
          return 100
        }
        return prev + 5
      })
    }, 200)

    return () => clearInterval(interval)
  }

  const createIncident = () => {
    router.push("/incidents/new")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Работает
          </Badge>
        )
      case "degraded":
      case "warning":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Деградация
          </Badge>
        )
      case "critical":
        return <Badge variant="destructive">Критический</Badge>
      default:
        return null
    }
  }

  const getServiceIcon = (name: string) => {
    if (name.includes("API")) return <Globe className="h-5 w-5" />
    if (name.includes("Auth")) return <Shield className="h-5 w-5" />
    if (name.includes("Web")) return <Server className="h-5 w-5" />
    if (name.includes("Database")) return <Database className="h-5 w-5" />
    if (name.includes("Cache")) return <HardDrive className="h-5 w-5" />
    return <Server className="h-5 w-5" />
  }

  const getResourceIcon = (name: string) => {
    switch (name) {
      case "CPU":
        return <Cpu className="h-5 w-5" />
      case "Memory":
        return <Memory className="h-5 w-5" />
      case "Disk":
        return <HardDrive className="h-5 w-5" />
      case "Network":
        return <Network className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Диагностика системы</h1>
        <div className="flex gap-2">
          <Button onClick={runDiagnostics} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Выполняется...
              </>
            ) : (
              "Запустить диагностику"
            )}
          </Button>
          {diagnosticResults && (
            <Button variant="outline" onClick={createIncident}>
              <FileWarning className="mr-2 h-4 w-4" />
              Создать инцидент
            </Button>
          )}
        </div>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Выполнение диагностики</CardTitle>
            <CardDescription>Пожалуйста, подождите, идет проверка системы</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 w-full" />
            <p className="mt-2 text-sm text-muted-foreground text-center">{progress}% завершено</p>
          </CardContent>
        </Card>
      )}

      {diagnosticResults && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Результаты диагностики</CardTitle>
              <CardDescription>
                Диагностика завершена {new Date(diagnosticResults.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Работает</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {diagnosticResults.summary.operational}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Деградация</p>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                        {diagnosticResults.summary.warning}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Критические</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {diagnosticResults.summary.critical}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Всего проверено</p>
                      <p className="text-2xl font-bold">{diagnosticResults.summary.total}</p>
                    </div>
                    <Server className="h-8 w-8 text-gray-500" />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="services" className="space-y-4">
            <TabsList>
              <TabsTrigger value="services">Сервисы</TabsTrigger>
              <TabsTrigger value="resources">Ресурсы</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Состояние сервисов</CardTitle>
                  <CardDescription>Проверка доступности и производительности сервисов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diagnosticResults.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full p-2 bg-primary/10">{getServiceIcon(service.name)}</div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            {service.issue && <p className="text-sm text-red-500">{service.issue}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {service.status !== "critical" && (
                            <p className="text-sm text-muted-foreground">{service.responseTime} мс</p>
                          )}
                          {getStatusBadge(service.status)}
                          {getStatusIcon(service.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Использование ресурсов</CardTitle>
                  <CardDescription>Проверка использования системных ресурсов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diagnosticResults.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full p-2 bg-primary/10">{getResourceIcon(resource.name)}</div>
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <div className="w-full mt-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">Использование: {resource.usage}%</span>
                              </div>
                              <Progress
                                value={resource.usage}
                                className={`h-2 w-[200px] ${
                                  resource.usage > 80
                                    ? "bg-red-200"
                                    : resource.usage > 60
                                      ? "bg-yellow-200"
                                      : "bg-green-200"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(resource.status)}
                          {getStatusIcon(resource.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Пороговые значения: Предупреждение &gt; 80%, Критическое &gt; 90%
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!isRunning && !diagnosticResults && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Server className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Запустите диагностику системы</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Диагностика проверит доступность сервисов, использование ресурсов и общее состояние системы
            </p>
            <Button onClick={runDiagnostics}>Запустить диагностику</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
