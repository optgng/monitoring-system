import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка дашборда...</span>
      </div>
    </div>
  )
}
