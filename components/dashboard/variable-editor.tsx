"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface VariableEditorProps {
  variable: any
  onSave: () => void
  onCancel: () => void
}

export function VariableEditor({ variable, onSave, onCancel }: VariableEditorProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Редактор переменных</CardTitle>
          <CardDescription>Настройка переменных дашборда</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Редактор переменных в разработке</p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={onSave}>
          Сохранить
        </Button>
      </div>
    </div>
  )
}
