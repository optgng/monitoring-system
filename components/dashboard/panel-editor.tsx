"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"

interface PanelEditorProps {
  panel?: any
  onSave: (panel: any) => void
  onCancel: () => void
}

export function PanelEditor({ panel, onSave, onCancel }: PanelEditorProps) {
  const [panelData, setPanelData] = useState(
    panel || {
      title: "",
      type: "timeseries",
      description: "",
      transparent: false,
      targets: [
        {
          expr: "",
          refId: "A",
          legendFormat: "",
          interval: "",
        },
      ],
      fieldConfig: {
        defaults: {
          color: {
            mode: "palette-classic",
          },
          custom: {
            axisLabel: "",
            axisPlacement: "auto",
            barAlignment: 0,
            drawStyle: "line",
            fillOpacity: 0,
            gradientMode: "none",
            hideFrom: {
              legend: false,
              tooltip: false,
              vis: false,
            },
            lineInterpolation: "linear",
            lineWidth: 1,
            pointSize: 5,
            scaleDistribution: {
              type: "linear",
            },
            showPoints: "auto",
            spanNulls: false,
            stacking: {
              group: "A",
              mode: "none",
            },
            thresholdsStyle: {
              mode: "off",
            },
          },
          mappings: [],
          thresholds: {
            mode: "absolute",
            steps: [
              {
                color: "green",
                value: null,
              },
              {
                color: "red",
                value: 80,
              },
            ],
          },
          unit: "short",
        },
        overrides: [],
      },
      options: {
        legend: {
          calcs: [],
          displayMode: "list",
          placement: "bottom",
        },
        tooltip: {
          mode: "single",
          sort: "none",
        },
      },
    },
  )

  const handlePanelChange = (field: string, value: any) => {
    setPanelData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (path: string[], value: any) => {
    setPanelData((prev) => {
      const newPanel = { ...prev }
      let current = newPanel
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {}
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newPanel
    })
  }

  const handleTargetChange = (index: number, field: string, value: any) => {
    setPanelData((prev) => ({
      ...prev,
      targets: prev.targets.map((target, i) => (i === index ? { ...target, [field]: value } : target)),
    }))
  }

  const addTarget = () => {
    setPanelData((prev) => ({
      ...prev,
      targets: [
        ...prev.targets,
        {
          expr: "",
          refId: String.fromCharCode(65 + prev.targets.length),
          legendFormat: "",
          interval: "",
        },
      ],
    }))
  }

  const removeTarget = (index: number) => {
    setPanelData((prev) => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index),
    }))
  }

  const addThreshold = () => {
    setPanelData((prev) => ({
      ...prev,
      fieldConfig: {
        ...prev.fieldConfig,
        defaults: {
          ...prev.fieldConfig.defaults,
          thresholds: {
            ...prev.fieldConfig.defaults.thresholds,
            steps: [
              ...prev.fieldConfig.defaults.thresholds.steps,
              {
                color: "yellow",
                value: 50,
              },
            ],
          },
        },
      },
    }))
  }

  const removeThreshold = (index: number) => {
    setPanelData((prev) => ({
      ...prev,
      fieldConfig: {
        ...prev.fieldConfig,
        defaults: {
          ...prev.fieldConfig.defaults,
          thresholds: {
            ...prev.fieldConfig.defaults.thresholds,
            steps: prev.fieldConfig.defaults.thresholds.steps.filter((_, i) => i !== index),
          },
        },
      },
    }))
  }

  const updateThreshold = (index: number, field: string, value: any) => {
    setPanelData((prev) => ({
      ...prev,
      fieldConfig: {
        ...prev.fieldConfig,
        defaults: {
          ...prev.fieldConfig.defaults,
          thresholds: {
            ...prev.fieldConfig.defaults.thresholds,
            steps: prev.fieldConfig.defaults.thresholds.steps.map((step, i) =>
              i === index ? { ...step, [field]: value } : step,
            ),
          },
        },
      },
    }))
  }

  const handleSave = () => {
    if (!panelData.title) {
      alert("Пожалуйста, введите название панели")
      return
    }
    onSave(panelData)
  }

  const panelTypes = [
    { value: "timeseries", label: "Time Series" },
    { value: "barchart", label: "Bar Chart" },
    { value: "stat", label: "Stat" },
    { value: "piechart", label: "Pie Chart" },
    { value: "gauge", label: "Gauge" },
  ]

  const monitoringUnits = [
    { value: "short", label: "Короткое" },
    { value: "bytes", label: "Байты" },
    { value: "decbytes", label: "Десятичные байты" },
    { value: "bits", label: "Биты" },
    { value: "decbits", label: "Десятичные биты" },
    { value: "percent", label: "Проценты (0-100)" },
    { value: "percentunit", label: "Проценты (0.0-1.0)" },
    { value: "seconds", label: "Секунды" },
    { value: "milliseconds", label: "Миллисекунды" },
    { value: "microseconds", label: "Микросекунды" },
    { value: "nanoseconds", label: "Наносекунды" },
    { value: "hertz", label: "Герц (1/с)" },
    { value: "rpm", label: "Обороты в минуту" },
    { value: "celsius", label: "Цельсий (°C)" },
    { value: "fahrenheit", label: "Фаренгейт (°F)" },
    { value: "kelvin", label: "Кельвин (K)" },
    { value: "humidity", label: "Влажность (%H)" },
    { value: "pressure", label: "Давление (hPa)" },
    { value: "volt", label: "Вольт" },
    { value: "amp", label: "Ампер" },
    { value: "watt", label: "Ватт" },
    { value: "kwatt", label: "Киловатт" },
    { value: "watth", label: "Ватт-час" },
    { value: "kwatth", label: "Киловатт-час" },
    { value: "joule", label: "Джоуль" },
    { value: "ev", label: "Электрон-вольт" },
    { value: "ops", label: "Операций в секунду" },
    { value: "rps", label: "Запросов в секунду" },
    { value: "cps", label: "Подключений в секунду" },
    { value: "pps", label: "Пакетов в секунду" },
    { value: "bps", label: "Бит в секунду" },
    { value: "Bps", label: "Байт в секунду" },
    { value: "binBps", label: "Бинарные байты в секунду" },
    { value: "binbps", label: "Бинарные биты в секунду" },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="queries">Запросы</TabsTrigger>
          <TabsTrigger value="visualization">Визуализация</TabsTrigger>
          <TabsTrigger value="field">Настройки полей</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки панели</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panel-title">Название панели</Label>
                  <Input
                    id="panel-title"
                    value={panelData.title}
                    onChange={(e) => handlePanelChange("title", e.target.value)}
                    placeholder="Введите название панели"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panel-type">Тип панели</Label>
                  <Select value={panelData.type} onValueChange={(value) => handlePanelChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип панели" />
                    </SelectTrigger>
                    <SelectContent>
                      {panelTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="panel-description">Описание</Label>
                <Textarea
                  id="panel-description"
                  value={panelData.description}
                  onChange={(e) => handlePanelChange("description", e.target.value)}
                  placeholder="Введите описание панели"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="transparent"
                  checked={panelData.transparent}
                  onCheckedChange={(checked) => handlePanelChange("transparent", checked)}
                />
                <Label htmlFor="transparent">Прозрачный фон</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Запросы данных</CardTitle>
                  <CardDescription>Настройте PromQL запросы для получения данных</CardDescription>
                </div>
                <Button onClick={addTarget} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить запрос
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {panelData.targets.map((target, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Запрос {target.refId}</Label>
                      {panelData.targets.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeTarget(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`expr-${index}`}>PromQL запрос</Label>
                      <Textarea
                        id={`expr-${index}`}
                        value={target.expr}
                        onChange={(e) => handleTargetChange(index, "expr", e.target.value)}
                        placeholder="Введите PromQL запрос (например: up{job='prometheus'})"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`legend-${index}`}>Формат легенды</Label>
                        <Input
                          id={`legend-${index}`}
                          value={target.legendFormat}
                          onChange={(e) => handleTargetChange(index, "legendFormat", e.target.value)}
                          placeholder="{{instance}}"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`interval-${index}`}>Интервал</Label>
                        <Input
                          id={`interval-${index}`}
                          value={target.interval}
                          onChange={(e) => handleTargetChange(index, "interval", e.target.value)}
                          placeholder="auto"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>Настройки визуализации</CardTitle>
              <CardDescription>Настройте внешний вид панели</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {panelData.type === "timeseries" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Стиль линии</Label>
                      <Select
                        value={panelData.fieldConfig?.defaults?.custom?.drawStyle}
                        onValueChange={(value) =>
                          handleNestedChange(["fieldConfig", "defaults", "custom", "drawStyle"], value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Линия</SelectItem>
                          <SelectItem value="bars">Столбцы</SelectItem>
                          <SelectItem value="points">Точки</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Толщина линии</Label>
                      <Input
                        type="number"
                        value={panelData.fieldConfig?.defaults?.custom?.lineWidth}
                        onChange={(e) =>
                          handleNestedChange(["fieldConfig", "defaults", "custom", "lineWidth"], Number(e.target.value))
                        }
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Интерполяция</Label>
                      <Select
                        value={panelData.fieldConfig?.defaults?.custom?.lineInterpolation}
                        onValueChange={(value) =>
                          handleNestedChange(["fieldConfig", "defaults", "custom", "lineInterpolation"], value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Линейная</SelectItem>
                          <SelectItem value="smooth">Сглаженная</SelectItem>
                          <SelectItem value="stepBefore">Ступенчатая (до)</SelectItem>
                          <SelectItem value="stepAfter">Ступенчатая (после)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Заливка (%)</Label>
                      <Input
                        type="number"
                        value={panelData.fieldConfig?.defaults?.custom?.fillOpacity}
                        onChange={(e) =>
                          handleNestedChange(
                            ["fieldConfig", "defaults", "custom", "fillOpacity"],
                            Number(e.target.value),
                          )
                        }
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Размер точек</Label>
                      <Input
                        type="number"
                        value={panelData.fieldConfig?.defaults?.custom?.pointSize}
                        onChange={(e) =>
                          handleNestedChange(["fieldConfig", "defaults", "custom", "pointSize"], Number(e.target.value))
                        }
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Режим стекинга</Label>
                    <Select
                      value={panelData.fieldConfig?.defaults?.custom?.stacking?.mode}
                      onValueChange={(value) =>
                        handleNestedChange(["fieldConfig", "defaults", "custom", "stacking", "mode"], value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Без стекинга</SelectItem>
                        <SelectItem value="normal">Обычный</SelectItem>
                        <SelectItem value="percent">Процентный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {panelData.type === "barchart" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ориентация</Label>
                      <Select
                        value={panelData.options?.orientation || "auto"}
                        onValueChange={(value) => handleNestedChange(["options", "orientation"], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Авто</SelectItem>
                          <SelectItem value="horizontal">Горизонтальная</SelectItem>
                          <SelectItem value="vertical">Вертикальная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Выравнивание столбцов</Label>
                      <Select
                        value={panelData.fieldConfig?.defaults?.custom?.barAlignment?.toString() || "0"}
                        onValueChange={(value) =>
                          handleNestedChange(["fieldConfig", "defaults", "custom", "barAlignment"], Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-1">Слева</SelectItem>
                          <SelectItem value="0">По центру</SelectItem>
                          <SelectItem value="1">Справа</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {panelData.type === "stat" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ориентация</Label>
                      <Select
                        value={panelData.options?.orientation || "auto"}
                        onValueChange={(value) => handleNestedChange(["options", "orientation"], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Авто</SelectItem>
                          <SelectItem value="horizontal">Горизонтальная</SelectItem>
                          <SelectItem value="vertical">Вертикальная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Режим цвета</Label>
                      <Select
                        value={panelData.options?.colorMode || "value"}
                        onValueChange={(value) => handleNestedChange(["options", "colorMode"], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Нет</SelectItem>
                          <SelectItem value="value">По значению</SelectItem>
                          <SelectItem value="background">Фон</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Размер текста</Label>
                    <Select
                      value={panelData.options?.textMode || "auto"}
                      onValueChange={(value) => handleNestedChange(["options", "textMode"], value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Авто</SelectItem>
                        <SelectItem value="value">Только значение</SelectItem>
                        <SelectItem value="value_and_name">Значение и название</SelectItem>
                        <SelectItem value="name">Только название</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {panelData.type === "piechart" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Тип отображения</Label>
                      <Select
                        value={panelData.options?.pieType || "pie"}
                        onValueChange={(value) => handleNestedChange(["options", "pieType"], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pie">Круговая</SelectItem>
                          <SelectItem value="donut">Кольцевая</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Отображение значений</Label>
                      <Select
                        value={panelData.options?.displayLabels || "name"}
                        onValueChange={(value) => handleNestedChange(["options", "displayLabels"], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Название</SelectItem>
                          <SelectItem value="value">Значение</SelectItem>
                          <SelectItem value="percent">Процент</SelectItem>
                          <SelectItem value="name_value">Название и значение</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {panelData.type === "gauge" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Минимальное значение</Label>
                      <Input
                        type="number"
                        value={panelData.fieldConfig?.defaults?.min || ""}
                        onChange={(e) => handleNestedChange(["fieldConfig", "defaults", "min"], Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Максимальное значение</Label>
                      <Input
                        type="number"
                        value={panelData.fieldConfig?.defaults?.max || ""}
                        onChange={(e) => handleNestedChange(["fieldConfig", "defaults", "max"], Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Показать пороги</Label>
                      <Switch
                        checked={panelData.options?.showThresholdMarkers || false}
                        onCheckedChange={(checked) => handleNestedChange(["options", "showThresholdMarkers"], checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Показать подписи порогов</Label>
                    <Switch
                      checked={panelData.options?.showThresholdLabels || false}
                      onCheckedChange={(checked) => handleNestedChange(["options", "showThresholdLabels"], checked)}
                    />
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Легенда</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={panelData.options?.legend?.displayMode}
                    onValueChange={(value) => handleNestedChange(["options", "legend", "displayMode"], value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Режим отображения" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">Список</SelectItem>
                      <SelectItem value="table">Таблица</SelectItem>
                      <SelectItem value="hidden">Скрыта</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={panelData.options?.legend?.placement}
                    onValueChange={(value) => handleNestedChange(["options", "legend", "placement"], value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Расположение" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Снизу</SelectItem>
                      <SelectItem value="right">Справа</SelectItem>
                      <SelectItem value="top">Сверху</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field">
          <Card>
            <CardHeader>
              <CardTitle>Настройки полей</CardTitle>
              <CardDescription>Настройте форматирование и пороговые значения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Единицы измерения</Label>
                <Select
                  value={panelData.fieldConfig?.defaults?.unit || "short"}
                  onValueChange={(value) => handleNestedChange(["fieldConfig", "defaults", "unit"], value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monitoringUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Пороговые значения</Label>
                  <Button onClick={addThreshold} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить порог
                  </Button>
                </div>
                <div className="space-y-2">
                  {panelData.fieldConfig?.defaults?.thresholds?.steps?.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={step.color}
                        onChange={(e) => updateThreshold(index, "color", e.target.value)}
                        className="w-16"
                      />
                      <Input
                        type="number"
                        value={step.value || ""}
                        onChange={(e) =>
                          updateThreshold(index, "value", e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder="Значение"
                        className="flex-1"
                      />
                      {panelData.fieldConfig.defaults.thresholds.steps.length > 2 && (
                        <Button variant="ghost" size="sm" onClick={() => removeThreshold(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Десятичные знаки</Label>
                <Input
                  type="number"
                  value={panelData.fieldConfig?.defaults?.decimals || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      ["fieldConfig", "defaults", "decimals"],
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  min="0"
                  max="10"
                  placeholder="Авто"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить панель</Button>
      </div>
    </div>
  )
}
