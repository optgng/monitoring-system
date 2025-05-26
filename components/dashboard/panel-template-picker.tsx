"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart3,
  LineChart,
  Gauge,
  Table2,
  PieChart,
  Activity,
  Plus,
  Search,
  Copy,
  Eye
} from 'lucide-react'
import { dashboardApi, Panel } from '@/lib/dashboard-api'
import { toast } from 'sonner'

interface PanelTemplate {
  type: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'basic' | 'monitoring' | 'advanced'
  template: Partial<Panel>
}

interface PanelTemplatePickerProps {
  onSelectTemplate: (template: Partial<Panel>) => void
  trigger?: React.ReactNode
}

const PANEL_TYPES: PanelTemplate[] = [
  {
    type: 'timeseries',
    title: 'График временных рядов',
    description: 'Отображение метрик во времени',
    icon: LineChart,
    category: 'basic',
    template: {
      type: 'timeseries',
      title: 'Новый график',
      gridPos: { h: 8, w: 12, x: 0, y: 0 },
      targets: [],
      fieldConfig: {
        defaults: {
          color: { mode: 'palette-classic' },
          custom: {
            axisPlacement: 'auto',
            barAlignment: 0,
            drawStyle: 'line',
            fillOpacity: 0,
            gradientMode: 'none',
            hideFrom: { legend: false, tooltip: false, vis: false },
            lineInterpolation: 'linear',
            lineWidth: 1,
            pointSize: 5,
            scaleDistribution: { type: 'linear' },
            showPoints: 'auto',
            spanNulls: false,
            stacking: { group: 'A', mode: 'none' },
            thresholdsStyle: { mode: 'off' }
          },
          mappings: [],
          thresholds: {
            mode: 'absolute',
            steps: [
              { color: 'green', value: null },
              { color: 'red', value: 80 }
            ]
          }
        },
        overrides: []
      },
      options: {
        legend: { calcs: [], displayMode: 'list', placement: 'bottom' },
        tooltip: { mode: 'single', sort: 'none' }
      }
    }
  },
  {
    type: 'stat',
    title: 'Числовое значение',
    description: 'Отображение одного числового значения',
    icon: Gauge,
    category: 'basic',
    template: {
      type: 'stat',
      title: 'Новое значение',
      gridPos: { h: 8, w: 8, x: 0, y: 0 },
      targets: [],
      fieldConfig: {
        defaults: {
          mappings: [],
          thresholds: {
            mode: 'absolute',
            steps: [
              { color: 'green', value: null },
              { color: 'yellow', value: 70 },
              { color: 'red', value: 85 }
            ]
          }
        },
        overrides: []
      },
      options: {
        colorMode: 'value',
        graphMode: 'area',
        justifyMode: 'auto',
        orientation: 'auto',
        reduceOptions: {
          calcs: ['lastNotNull'],
          fields: '',
          values: false
        },
        text: {},
        textMode: 'auto'
      }
    }
  },
  {
    type: 'gauge',
    title: 'Шкала',
    description: 'Круговая шкала для отображения значений в диапазоне',
    icon: Activity,
    category: 'basic',
    template: {
      type: 'gauge',
      title: 'Новая шкала',
      gridPos: { h: 8, w: 8, x: 0, y: 0 },
      targets: [],
      fieldConfig: {
        defaults: {
          mappings: [],
          max: 100,
          min: 0,
          thresholds: {
            mode: 'absolute',
            steps: [
              { color: 'green', value: null },
              { color: 'yellow', value: 70 },
              { color: 'red', value: 85 }
            ]
          }
        },
        overrides: []
      },
      options: {
        orientation: 'auto',
        reduceOptions: {
          calcs: ['lastNotNull'],
          fields: '',
          values: false
        },
        showThresholdLabels: false,
        showThresholdMarkers: true,
        text: {}
      }
    }
  },
  {
    type: 'table',
    title: 'Таблица',
    description: 'Табличное отображение данных',
    icon: Table2,
    category: 'basic',
    template: {
      type: 'table',
      title: 'Новая таблица',
      gridPos: { h: 8, w: 12, x: 0, y: 0 },
      targets: [],
      fieldConfig: {
        defaults: {
          mappings: [],
          thresholds: {
            mode: 'absolute',
            steps: [
              { color: 'green', value: null },
              { color: 'red', value: 80 }
            ]
          }
        },
        overrides: []
      },
      options: {
        showHeader: true,
        cellHeight: 'sm',
        footer: {
          show: false,
          reducer: ['sum'],
          countRows: false
        }
      }
    }
  },
  {
    type: 'barchart',
    title: 'Гистограмма',
    description: 'Столбчатый график для сравнения значений',
    icon: BarChart3,
    category: 'basic',
    template: {
      type: 'barchart',
      title: 'Новая гистограмма',
      gridPos: { h: 8, w: 12, x: 0, y: 0 },
      targets: [],
      fieldConfig: {
        defaults: {
          mappings: [],
          thresholds: {
            mode: 'absolute',
            steps: [
              { color: 'green', value: null },
              { color: 'red', value: 80 }
            ]
          }
        },
        overrides: []
      },
      options: {
        orientation: 'horizontal',
        groupWidth: 0.7,
        barWidth: 0.97,
        showValue: 'auto',
        stacking: 'none',
        legend: {
          displayMode: 'list',
          placement: 'bottom',
          showLegend: true
        },
        tooltip: {
          mode: 'single',
          sort: 'none'
        }
      }
    }
  },
  {
    type: 'piechart',
    title: 'Круговая диаграмма',
    description: 'Процентное распределение значений',
    icon: PieChart,
    category: 'basic',
    template: {
      type: 'piechart',
      title: 'Новая круговая диаграмма',
      gridPos: { h: 8, w: 8, x: 0, y: 0 },
      targets: [],
      fieldConfig: {
        defaults: {
          mappings: [],
          thresholds: {
            mode: 'absolute',
            steps: [
              { color: 'green', value: null },
              { color: 'red', value: 80 }
            ]
          }
        },
        overrides: []
      },
      options: {
        reduceOptions: {
          calcs: ['lastNotNull'],
          fields: '',
          values: false
        },
        pieType: 'pie',
        tooltip: {
          mode: 'single',
          sort: 'none'
        },
        legend: {
          displayMode: 'list',
          placement: 'bottom',
          showLegend: true
        }
      }
    }
  }
]

export function PanelTemplatePicker({ onSelectTemplate, trigger }: PanelTemplatePickerProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewTemplate, setPreviewTemplate] = useState<Partial<Panel> | null>(null)

  // Фильтрация шаблонов
  const filteredTemplates = PANEL_TYPES.filter(template => {
    const matchesSearch = searchTerm === '' ||
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = async (template: PanelTemplate) => {
    // Попытаемся получить более детальный шаблон с API если доступно
    try {
      const response = await dashboardApi.getPanelTemplate(template.type)
      if (response.status === 'success' && response.data) {
        onSelectTemplate(response.data)
        toast.success(`Шаблон "${template.title}" применен`)
      } else {
        // Используем базовый шаблон если API недоступно
        onSelectTemplate(template.template)
        toast.success(`Шаблон "${template.title}" применен`)
      }
    } catch (error) {
      // Fallback к базовому шаблону
      onSelectTemplate(template.template)
      toast.success(`Шаблон "${template.title}" применен`)
    }

    setOpen(false)
  }

  const handlePreview = (template: PanelTemplate) => {
    setPreviewTemplate(template.template)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить панель
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выберите тип панели</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Поиск и фильтры */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-templates">Поиск шаблонов</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-templates"
                  placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Категория</Label>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList>
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="basic">Базовые</TabsTrigger>
                  <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
                  <TabsTrigger value="advanced">Расширенные</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Сетка шаблонов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon
              return (
                <Card
                  key={template.type}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-sm">{template.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1"
                      >
                        Выбрать
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(template)}
                        className="px-3"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-8 w-8 mx-auto mb-2" />
              <p>Шаблоны не найдены</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос или категорию</p>
            </div>
          )}

          {/* Предварительный просмотр */}
          {previewTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Предварительный просмотр</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(previewTemplate, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
