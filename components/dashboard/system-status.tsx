import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export function SystemStatus() {
  const systems = [
    {
      id: 1,
      name: "Веб-серверы",
      status: "operational",
      components: [
        { name: "Web-01", status: "operational" },
        { name: "Web-02", status: "operational" },
        { name: "Web-03", status: "operational" },
      ],
    },
    {
      id: 2,
      name: "Базы данных",
      status: "degraded",
      components: [
        { name: "DB-01", status: "degraded" },
        { name: "DB-02", status: "operational" },
        { name: "DB-Replica", status: "operational" },
      ],
    },
    {
      id: 3,
      name: "API Сервисы",
      status: "operational",
      components: [
        { name: "API Gateway", status: "operational" },
        { name: "Auth Service", status: "operational" },
        { name: "Data Service", status: "operational" },
      ],
    },
    {
      id: 4,
      name: "Кэширование",
      status: "outage",
      components: [
        { name: "Redis-01", status: "outage" },
        { name: "Redis-02", status: "operational" },
      ],
    },
    {
      id: 5,
      name: "Мониторинг",
      status: "operational",
      components: [
        { name: "Prometheus", status: "operational" },
        { name: "Grafana", status: "operational" },
        { name: "AlertManager", status: "operational" },
      ],
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Работает</Badge>
      case "degraded":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            Деградация
          </Badge>
        )
      case "outage":
        return <Badge variant="destructive">Недоступен</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {systems.map((system) => (
        <Card key={system.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{system.name}</CardTitle>
              {getStatusBadge(system.status)}
            </div>
            <CardDescription>{system.components.length} компонентов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {system.components.map((component, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                  <span className="font-medium">{component.name}</span>
                  {getStatusIcon(component.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
