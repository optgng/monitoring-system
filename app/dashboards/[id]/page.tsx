"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Settings } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardId = params.id
  const userRole = getCurrentUser().role

  // Имитация данных дашборда
  const dashboardData = {
    id: dashboardId,
    title: "Общий обзор системы",
    description: "Основные метрики всех систем",
    lastUpdated: "2 часа назад",
  }

  // Данные для графиков
  const performanceData = [
    { name: "00:00", cpu: 40, memory: 24, disk: 10 },
    { name: "04:00", cpu: 30, memory: 25, disk: 10 },
    { name: "08:00", cpu: 60, memory: 40, disk: 12 },
    { name: "12:00", cpu: 85, memory: 65, disk: 15 },
    { name: "16:00", cpu: 70, memory: 50, disk: 14 },
    { name: "20:00", cpu: 55, memory: 45, disk: 13 },
    { name: "Сейчас", cpu: 65, memory: 48, disk: 14 },
  ]

  const resourceData = [
    { name: "Web", value: 35 },
    { name: "DB", value: 25 },
    { name: "API", value: 20 },
    { name: "Cache", value: 15 },
    { name: "Other", value: 5 },
  ]

  const activityData = [
    { time: "00:00", requests: 120 },
    { time: "04:00", requests: 80 },
    { time: "08:00", requests: 250 },
    { time: "12:00", requests: 450 },
    { time: "16:00", requests: 380 },
    { time: "20:00", requests: 290 },
    { time: "Сейчас", requests: 320 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  const generateReport = () => {
    router.push(`/reports?dashboard=${dashboardId}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dashboardData.title}</h1>
          <p className="text-muted-foreground">{dashboardData.description}</p>
        </div>
        <div className="flex gap-2">
          {(userRole === "manager" || userRole === "admin") && (
            <Button onClick={generateReport}>
              <FileText className="mr-2 h-4 w-4" />
              Сформировать отчет
            </Button>
          )}
          {userRole === "admin" && (
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Настроить
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
          <TabsTrigger value="resources">Ресурсы</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Нагрузка на системы</CardTitle>
                <CardDescription>Использование ресурсов за последние 24 часа</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU (%)" />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Память (%)" />
                    <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Диск (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
                <CardDescription>Общая информация о системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Всего серверов</span>
                      <span className="text-2xl font-bold">24</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Активных</span>
                      <span className="text-2xl font-bold text-green-500">22</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Проблемных</span>
                      <span className="text-2xl font-bold text-red-500">2</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Средняя нагрузка CPU</span>
                        <span>65%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "65%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Использование памяти</span>
                        <span>48%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "48%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Использование диска</span>
                        <span>14%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-yellow-500" style={{ width: "14%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Распределение ресурсов</CardTitle>
                <CardDescription>По типам сервисов</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {resourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Активность системы</CardTitle>
                <CardDescription>Количество запросов в минуту</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#ff7300" name="Запросы/мин" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Содержимое вкладки производительности */}
          <Card>
            <CardHeader>
              <CardTitle>Детальная производительность</CardTitle>
              <CardDescription>Подробные метрики производительности системы</CardDescription>
            </CardHeader>
            <CardContent>{/* Здесь будут более детальные графики производительности */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {/* Содержимое вкладки ресурсов */}
          <Card>
            <CardHeader>
              <CardTitle>Использование ресурсов</CardTitle>
              <CardDescription>Детальная информация об использовании ресурсов</CardDescription>
            </CardHeader>
            <CardContent>{/* Здесь будут более детальные графики использования ресурсов */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
