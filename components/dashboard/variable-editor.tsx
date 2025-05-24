"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface VariableEditorProps {
  variable?: any
  onSave: (variable: any) => void
  onCancel: () => void
}

export function VariableEditor({ variable, onSave, onCancel }: VariableEditorProps) {
  const [variableData, setVariableData] = useState(
    variable || {
      name: "",
      type: "query",
      label: "",
      description: "",
      query: "",
      datasource: "prometheus",
      refresh: "on_dashboard_load",
      sort: "disabled",
      multi: false,
      includeAll: false,
      allValue: "",
      current: {
        selected: false,
        text: "",
        value: "",
      },
      options: [],
      regex: "",
      hide: "dont_hide",
    },
  )

  const handleVariableChange = (field: string, value: any) => {
    setVariableData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!variableData.name) {
      alert("Пожалуйста, введите название переменной")
      return
    }
    onSave(variableData)
  }

  const variableTypes = [
    { value: "query", label: "Запрос" },
    { value: "custom", label: "Пользовательская" },
    { value: "constant", label: "Константа" },
    { value: "interval", label: "Интервал" },
    { value: "textbox", label: "Текстовое поле" },
  ]

  const refreshOptions = [
    { value: "never", label: "Никогда" },
    { value: "on_dashboard_load", label: "При загрузке дашборда" },
    { value: "on_time_range_changed", label: "При изменении времени" },
  ]

  const sortOptions = [
    { value: "disabled", label: "Отключена" },
    { value: "alphabetical_asc", label: "По алфавиту (А-Я)" },
    { value: "alphabetical_desc", label: "По алфавиту (Я-А)" },
    { value: "numerical_asc", label: "По возрастанию" },
    { value: "numerical_desc", label: "По убыванию" },
  ]

  const hideOptions = [
    { value: "dont_hide", label: "Не скрывать" },
    { value: "hide_label", label: "Скрыть подпись" },
    { value: "hide_variable", label: "Скрыть переменную" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки переменной</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variable-name">Название переменной</Label>
              <Input
                id="variable-name"
                value={variableData.name}
                onChange={(e) => handleVariableChange("name", e.target.value)}
                placeholder="Введите название переменной"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variable-type">Тип переменной</Label>
              <Select value={variableData.type} onValueChange={(value) => handleVariableChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {variableTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variable-label">Подпись</Label>
            <Input
              id="variable-label"
              value={variableData.label}
              onChange={(e) => handleVariableChange("label", e.target.value)}
              placeholder="Подпись для отображения"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variable-description">Описание</Label>
            <Textarea
              id="variable-description"
              value={variableData.description}
              onChange={(e) => handleVariableChange("description", e.target.value)}
              placeholder="Описание переменной"
            />
          </div>

          {variableData.type === "query" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="variable-query">Запрос</Label>
                <Textarea
                  id="variable-query"
                  value={variableData.query}
                  onChange={(e) => handleVariableChange("query", e.target.value)}
                  placeholder="label_values(up, instance)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variable-regex">Регулярное выражение</Label>
                <Input
                  id="variable-regex"
                  value={variableData.regex}
                  onChange={(e) => handleVariableChange("regex", e.target.value)}
                  placeholder="/.*/"
                />
              </div>
            </>
          )}

          {variableData.type === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="variable-options">Значения (через запятую)</Label>
              <Textarea
                id="variable-options"
                value={variableData.options?.map((opt) => opt.text).join(", ") || ""}
                onChange={(e) => {
                  const values = e.target.value.split(",").map((val) => val.trim())
                  const options = values.map((val) => ({ text: val, value: val }))
                  handleVariableChange("options", options)
                }}
                placeholder="значение1, значение2, значение3"
              />
            </div>
          )}

          {variableData.type === "constant" && (
            <div className="space-y-2">
              <Label htmlFor="variable-value">Значение</Label>
              <Input
                id="variable-value"
                value={variableData.current?.value || ""}
                onChange={(e) =>
                  handleVariableChange("current", {
                    ...variableData.current,
                    value: e.target.value,
                    text: e.target.value,
                  })
                }
                placeholder="Константное значение"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Обновление</Label>
              <Select value={variableData.refresh} onValueChange={(value) => handleVariableChange("refresh", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refreshOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Сортировка</Label>
              <Select value={variableData.sort} onValueChange={(value) => handleVariableChange("sort", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Отображение</Label>
              <Select value={variableData.hide} onValueChange={(value) => handleVariableChange("hide", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hideOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="multi"
                checked={variableData.multi}
                onCheckedChange={(checked) => handleVariableChange("multi", checked)}
              />
              <Label htmlFor="multi">Множественный выбор</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-all"
                checked={variableData.includeAll}
                onCheckedChange={(checked) => handleVariableChange("includeAll", checked)}
              />
              <Label htmlFor="include-all">Включить опцию "Все"</Label>
            </div>

            {variableData.includeAll && (
              <div className="space-y-2">
                <Label htmlFor="all-value">Значение для "Все"</Label>
                <Input
                  id="all-value"
                  value={variableData.allValue}
                  onChange={(e) => handleVariableChange("allValue", e.target.value)}
                  placeholder=".*"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить переменную</Button>
      </div>
    </div>
  )
}
