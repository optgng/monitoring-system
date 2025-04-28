import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"

export function RecentAlerts() {
  const alerts = [
    {
      id: 1,
      severity: "critical",
      title: "Высокая нагрузка CPU",
      description: "Сервер DB-01 - CPU использование > 90% в течение 15 минут",
      time: "10 минут назад",
      icon: AlertTriangle,
    },
    {
      id: 2,
      severity: "warning",
      title: "Низкое свободное место на диске",
      description: "Сервер Web-02 - свободно менее 10% дискового пространства",
      time: "25 минут назад",
      icon: AlertCircle,
    },
    {
      id: 3,
      severity: "info",
      title: "Перезагрузка сервиса",
      description: "API Gateway был автоматически перезапущен",
      time: "1 час назад",
      icon: Info,
    },
    {
      id: 4,
      severity: "warning",
      title: "Высокая задержка сети",
      description: "Задержка между DC1 и DC2 превышает 100ms",
      time: "2 часа назад",
      icon: AlertCircle,
    },
    {
      id: 5,
      severity: "critical",
      title: "Недоступен сервис",
      description: "Сервис Auth недоступен - проверка работоспособности не пройдена",
      time: "3 часа назад",
      icon: AlertTriangle,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Недавние оповещения</CardTitle>
        <CardDescription>Последние 5 оповещений системы</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div
                className={`rounded-full p-2 ${
                  alert.severity === "critical"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : alert.severity === "warning"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                <alert.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{alert.title}</h4>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "warning"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {alert.severity === "critical"
                      ? "Критический"
                      : alert.severity === "warning"
                        ? "Предупреждение"
                        : "Информация"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
