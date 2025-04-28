"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "recharts"

const data = [
  {
    name: "00:00",
    cpu: 40,
    memory: 24,
    disk: 10,
  },
  {
    name: "04:00",
    cpu: 30,
    memory: 25,
    disk: 10,
  },
  {
    name: "08:00",
    cpu: 60,
    memory: 40,
    disk: 12,
  },
  {
    name: "12:00",
    cpu: 85,
    memory: 65,
    disk: 15,
  },
  {
    name: "16:00",
    cpu: 70,
    memory: 50,
    disk: 14,
  },
  {
    name: "20:00",
    cpu: 55,
    memory: 45,
    disk: 13,
  },
  {
    name: "Сейчас",
    cpu: 65,
    memory: 48,
    disk: 14,
  },
]

export function Overview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Нагрузка на системы</CardTitle>
          <CardDescription>Использование ресурсов за последние 24 часа</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
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
      <Card className="col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Распределение ресурсов</CardTitle>
          <CardDescription>По типам сервисов</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Web", value: 35 },
                { name: "DB", value: 25 },
                { name: "API", value: 20 },
                { name: "Cache", value: 15 },
                { name: "Other", value: 5 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="Ресурсы (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Активность системы</CardTitle>
          <CardDescription>Количество запросов в минуту</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={[
                { time: "00:00", requests: 120 },
                { time: "04:00", requests: 80 },
                { time: "08:00", requests: 250 },
                { time: "12:00", requests: 450 },
                { time: "16:00", requests: 380 },
                { time: "20:00", requests: 290 },
                { time: "Сейчас", requests: 320 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#ff7300" name="Запросы/мин" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
