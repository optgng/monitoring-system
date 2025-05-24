"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AnnotationEditorProps {
  annotation?: any
  onSave: (annotation: any) => void
  onCancel: () => void
}

export function AnnotationEditor({ annotation, onSave, onCancel }: AnnotationEditorProps) {
  const [annotationData, setAnnotationData] = useState(
    annotation || {
      name: "",
      datasource: "prometheus",
      enable: true,
      hide: false,
      iconColor: "red",
      query: "",
      textField: "",
      titleField: "",
      tagsField: "",
      timeField: "",
      timeEndField: "",
      type: "dashboard",
      builtIn: 0,
      showIn: 0,
    },
  )

  const handleAnnotationChange = (field: string, value: any) => {
    setAnnotationData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!annotationData.name) {
      alert("Пожалуйста, введите название аннотации")
      return
    }
    onSave(annotationData)
  }

  const iconColors = [
    { value: "red", label: "Красный" },
    { value: "yellow", label: "Желтый" },
    { value: "green", label: "Зеленый" },
    { value: "blue", label: "Синий" },
    { value: "purple", label: "Фиолетовый" },
    { value: "orange", label: "Оранжевый" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки аннотации</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annotation-name">Название аннотации</Label>
              <Input
                id="annotation-name"
                value={annotationData.name}
                onChange={(e) => handleAnnotationChange("name", e.target.value)}
                placeholder="Введите название аннотации"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annotation-datasource">Источник данных</Label>
              <Select
                value={annotationData.datasource}
                onValueChange={(value) => handleAnnotationChange("datasource", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prometheus">Prometheus</SelectItem>
                  <SelectItem value="loki">Loki</SelectItem>
                  <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annotation-query">Запрос</Label>
            <Textarea
              id="annotation-query"
              value={annotationData.query}
              onChange={(e) => handleAnnotationChange("query", e.target.value)}
              placeholder="ALERTS{alertstate='firing'}"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title-field">Поле заголовка</Label>
              <Input
                id="title-field"
                value={annotationData.titleField}
                onChange={(e) => handleAnnotationChange("titleField", e.target.value)}
                placeholder="alertname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-field">Поле текста</Label>
              <Input
                id="text-field"
                value={annotationData.textField}
                onChange={(e) => handleAnnotationChange("textField", e.target.value)}
                placeholder="summary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time-field">Поле времени</Label>
              <Input
                id="time-field"
                value={annotationData.timeField}
                onChange={(e) => handleAnnotationChange("timeField", e.target.value)}
                placeholder="timestamp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags-field">Поле тегов</Label>
              <Input
                id="tags-field"
                value={annotationData.tagsField}
                onChange={(e) => handleAnnotationChange("tagsField", e.target.value)}
                placeholder="instance"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Цвет иконки</Label>
            <Select
              value={annotationData.iconColor}
              onValueChange={(value) => handleAnnotationChange("iconColor", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable"
                checked={annotationData.enable}
                onCheckedChange={(checked) => handleAnnotationChange("enable", checked)}
              />
              <Label htmlFor="enable">Включить аннотацию</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hide"
                checked={annotationData.hide}
                onCheckedChange={(checked) => handleAnnotationChange("hide", checked)}
              />
              <Label htmlFor="hide">Скрыть в настройках дашборда</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить аннотацию</Button>
      </div>
    </div>
  )
}
