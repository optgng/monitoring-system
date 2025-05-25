"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Panel } from "@/lib/dashboard-api"

interface PanelRendererProps {
  panel: Panel
}

export function PanelRenderer({ panel }: PanelRendererProps) {
  const renderPanelContent = () => {
    switch (panel.type) {
      case "stat":
        return (
          <div className="text-center py-8">
            <div className="text-3xl font-bold">42</div>
            <div className="text-sm text-muted-foreground">Значение метрики</div>
          </div>
        )
      case "graph":
        return (
          <div className="h-48 flex items-center justify-center bg-muted/20 rounded">
            <span className="text-muted-foreground">График будет здесь</span>
          </div>
        )
      case "table":
        return (
          <div className="h-48 flex items-center justify-center bg-muted/20 rounded">
            <span className="text-muted-foreground">Таблица будет здесь</span>
          </div>
        )
      case "text":
        return (
          <div className="p-4">
            <p className="text-muted-foreground">Текстовое содержимое панели</p>
          </div>
        )
      default:
        return (
          <div className="h-48 flex items-center justify-center bg-muted/20 rounded">
            <span className="text-muted-foreground">Неизвестный тип панели: {panel.type}</span>
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      {renderPanelContent()}
    </div>
  )
}
