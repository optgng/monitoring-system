import { Loader2 } from "lucide-react"

export default function DashboardSettingsLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Загрузка настроек дашборда...</span>
    </div>
  )
}
