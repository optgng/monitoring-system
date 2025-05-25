"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnnotationEditorProps {
  annotation: any
  onSave: () => void
  onCancel: () => void
}

export function AnnotationEditor({ annotation, onSave, onCancel }: AnnotationEditorProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Редактор аннотаций</CardTitle>
          <CardDescription>Настройка аннотаций дашборда</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Редактор аннотаций в разработке</p>
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
