"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, RotateCcw, Settings, Eye, EyeOff, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PanelManager, type PanelProps } from "@/components/dashboard/panel-manager"
import { getCurrentUser } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface DashboardData {
  id: string | number
  title: string
  description?: string
  type?: string
  lastUpdated?: string
  panels: PanelProps[]
}

interface DashboardLayoutProps {
  dashboardId: string | number
  initialData?: DashboardData
  onSave?: (data: DashboardData) => void
  readOnly?: boolean
}

export function DashboardLayout({ dashboardId, initialData, onSave, readOnly = false }: DashboardLayoutProps) {
  const [dashboard, setDashboard] = useState<DashboardData>(
    initialData || {
      id: dashboardId, title: "Новый дашборд",
      description: "Описание дашборда",
      panels: [],
    },
  );

  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [userRole, setUserRole] = useState<string>("viewer")
  const router = useRouter()

  useEffect(() => {
    async function loadUserRole() {
      const user = await getCurrentUser()
      setUserRole(user?.role || "viewer")
    }
    loadUserRole()
  }, [])

  const canEdit = (userRole === "admin" || userRole === "manager") && !readOnly
  const canGenerateReport = userRole === "admin" || userRole === "manager"

  // Handle panel changes
  const handlePanelsChange = (panels: PanelProps[]) => {
    setDashboard((prev) => ({ ...prev, panels }))
    setHasChanges(true)
  }

  // Save dashboard changes
  const saveDashboard = () => {
    // In a real application, this would save to a database
    onSave?.(dashboard)
    setHasChanges(false)
    toast({
      title: "Дашборд сохранен",
      description: "Все изменения успешно сохранены",
    })
  }

  // Discard changes
  const discardChanges = () => {
    if (initialData) {
      setDashboard(initialData)
    }
    setHasChanges(false)
    setIsEditing(false)
    toast({
      title: "Изменения отменены",
      description: "Все изменения были отменены",
    })
  }

  // Generate report
  const generateReport = () => {
    router.push(`/reports?dashboard=${dashboardId}`)
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dashboard.title}</h1>
          <p className="text-muted-foreground">{dashboard.description}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant={isEditing ? "default" : "outline"} onClick={toggleEditMode}>
                {isEditing ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Завершить редактирование
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Режим редактирования
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboards/${dashboardId}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки дашборда
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Поделиться
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {isEditing && hasChanges && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-md">
          <p className="text-sm">У вас есть несохраненные изменения</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={discardChanges}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Отменить
            </Button>
            <Button size="sm" onClick={saveDashboard}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </div>
      )}

      {/* Показываем панели напрямую без табов */}
      <div className="space-y-4">
        <PanelManager
          dashboardId={dashboardId}
          initialPanels={dashboard.panels}
          onPanelsChange={handlePanelsChange}
          readOnly={!isEditing}
        />
      </div>
    </div>
  )
}
