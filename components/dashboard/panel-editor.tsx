"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Panel } from "@/lib/dashboard-api"

interface PanelEditorProps {
  panel: Panel | null
  onSave: (panelData: Partial<Panel>) => void
  onCancel: () => void
}

export function PanelEditor({ panel, onSave, onCancel }: PanelEditorProps) {
  const [panelData, setPanelData] = useState({
    title: panel?.title || "",
    description: panel?.description || "",
    type: panel?.type || "stat",
    targets: panel?.targets || [{ expr: "", refId: "A" }],
  })

  const handleSave = () => {
    onSave({
      ...panelData,
      gridPos: panel?.gridPos || { h: 8, w: 12, x: 0, y: 0 },
      fieldConfig: panel?.fieldConfig || { defaults: {}, overrides: [] },
      options: panel?.options || {},
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
          <CardDescription>Настройте основные параметры панели</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название панели</Label>
            <Input
              id="title"
              value={panelData.title}
              onChange={(e) => setPanelData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Введите название панели"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={panelData.description}
              onChange={(e) => setPanelData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Введите описание панели"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип панели</Label>
            <Select
              value={panelData.type}
              onValueChange={(value) => setPanelData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип панели" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stat">Статистика</SelectItem>
                <SelectItem value="graph">График</SelectItem>
                <SelectItem value="table">Таблица</SelectItem>
                <SelectItem value="text">Текст</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </div>
    </div>
  )
}
