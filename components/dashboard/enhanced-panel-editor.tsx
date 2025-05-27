"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Save,
  X,
  Settings,
  Eye,
  Palette,
  Grid,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { dashboardApi, Panel, Target } from '@/lib/dashboard-api'
import { PromQLHelper } from './promql-helper'
import { PanelTemplatePicker } from './panel-template-picker'
import { toast } from 'sonner'

interface EnhancedPanelEditorProps {
  dashboardUid: string
  panel?: Panel
  isOpen: boolean
  onClose: () => void
  onSave: (panel: Panel) => void
  mode: 'create' | 'edit'
}

export function EnhancedPanelEditor({
  dashboardUid,
  panel,
  isOpen,
  onClose,
  onSave,
  mode
}: EnhancedPanelEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Form state
  const [formData, setFormData] = useState<Partial<Panel>>({
    title: '',
    description: '',
    type: 'timeseries', // Используем современный тип вместо устаревшего 'graph'
    gridPos: { h: 8, w: 12, x: 0, y: 0 },
    targets: [{
      expr: '',
      refId: 'A',
      datasource: { // Обязательно указываем datasource для target
        type: 'prometheus',
        uid: 'prometheus'
      }
    }],
    fieldConfig: {
      defaults: {},
      overrides: []
    },
    options: {},
    datasource: { // Обязательно указываем datasource на уровне панели
      type: 'prometheus',
      uid: 'prometheus'
    }
  })

  // PromQL validation state
  const [validationResults, setValidationResults] = useState<Map<string, {
    isValid: boolean
    warnings: string[]
  }>>(new Map())

  // Initialize form data
  useEffect(() => {
    if (panel && mode === 'edit') {
      setFormData(panel)
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        type: 'timeseries',
        gridPos: { h: 8, w: 12, x: 0, y: 0 },
        targets: [{
          expr: '',
          refId: 'A',
          datasource: {
            type: 'prometheus',
            uid: 'prometheus'
          }
        }],
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        options: {},
        datasource: {
          type: 'prometheus',
          uid: 'prometheus'
        }
      })
    }
  }, [panel, mode, isOpen])

  const updateFormData = (updates: Partial<Panel>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Обновляем updateTarget для обеспечения наличия datasource
  const updateTarget = (index: number, updates: Partial<Target>) => {
    const newTargets = [...(formData.targets || [])]
    // Убедимся, что у цели есть datasource
    if (!newTargets[index].datasource) {
      newTargets[index].datasource = formData.datasource || {
        type: 'prometheus',
        uid: 'prometheus'
      }
    }
    newTargets[index] = { ...newTargets[index], ...updates }
    updateFormData({ targets: newTargets })
  }

  // Обновляем addTarget для добавления datasource в новую цель
  const addTarget = () => {
    const newTargets = [...(formData.targets || [])]
    const nextRefId = String.fromCharCode(65 + newTargets.length) // A, B, C, ...
    newTargets.push({
      expr: '',
      refId: nextRefId,
      datasource: formData.datasource || { // Добавляем datasource для новой цели
        type: 'prometheus',
        uid: 'prometheus'
      }
    })
    updateFormData({ targets: newTargets })
  }

  const removeTarget = (index: number) => {
    const newTargets = (formData.targets || []).filter((_, i) => i !== index)
    updateFormData({ targets: newTargets })
  }

  const handleTemplateSelect = (template: Partial<Panel>) => {
    setFormData(prev => ({
      ...prev,
      ...template,
      title: prev.title || template.title,
      description: prev.description || template.description
    }))
    toast.success('Шаблон применен')
  }

  const handlePromQLValidation = (targetIndex: number, isValid: boolean, warnings: string[]) => {
    const newResults = new Map(validationResults)
    newResults.set(targetIndex.toString(), { isValid, warnings })
    setValidationResults(newResults)
  }

  const canSave = () => {
    if (!formData.title?.trim()) return false
    if (!formData.type) return false

    // Проверяем валидность всех PromQL запросов
    const hasInvalidQueries = Array.from(validationResults.values()).some(result => !result.isValid)
    return !hasInvalidQueries
  }

  // Обновляем handleSave для обеспечения правильной структуры запроса
  const handleSave = async () => {
    if (!canSave()) {
      toast.error('Пожалуйста, исправьте все ошибки перед сохранением')
      return
    }

    setIsSaving(true)
    try {
      // Убедимся, что у всех targets есть datasource
      const targets = formData.targets?.map(target => ({
        ...target,
        datasource: target.datasource || formData.datasource || {
          type: 'prometheus',
          uid: 'prometheus'
        }
      })) || [];

      const panelData: Panel = {
        ...formData,
        id: panel?.id || Date.now(),
        title: formData.title!,
        type: formData.type!,
        gridPos: formData.gridPos!,
        targets: targets,
        fieldConfig: formData.fieldConfig || { defaults: {}, overrides: [] },
        options: formData.options || {},
        datasource: formData.datasource || { // Убедимся, что у панели есть datasource
          type: 'prometheus',
          uid: 'prometheus'
        }
      }

      if (mode === 'create') {
        const response = await dashboardApi.createPanel(dashboardUid, panelData)
        if (response.status === 'success') {
          onSave(response.data)
          toast.success('Панель создана')
        } else {
          toast.error(response.message || 'Ошибка создания панели')
        }
      } else {
        const response = await dashboardApi.updatePanel(dashboardUid, panelData.id, panelData)
        if (response.status === 'success') {
          onSave(response.data)
          toast.success('Панель обновлена')
        } else {
          toast.error(response.message || 'Ошибка обновления панели')
        }
      }

      onClose()
    } catch (error) {
      console.error('Ошибка сохранения панели:', error)
      toast.error('Не удалось сохранить панель')
    } finally {
      setIsSaving(false)
    }
  }

  // Проверим модальное окно и убедимся, что оно корректно открывается
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Plus className="h-5 w-5" />
                Создание новой панели
              </>
            ) : (
              <>
                <Settings className="h-5 w-5" />
                Редактирование панели
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Удаляем шаблоны для панелей */}
          {/* {mode === 'create' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Выбор шаблона</CardTitle>
              </CardHeader>
              <CardContent>
                <PanelTemplatePicker
                  onSelectTemplate={handleTemplateSelect}
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Grid className="h-4 w-4 mr-2" />
                      Выбрать шаблон панели
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )} */}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Основные</TabsTrigger>
              <TabsTrigger value="queries">Запросы</TabsTrigger>
              <TabsTrigger value="visualization">Визуализация</TabsTrigger>
              <TabsTrigger value="layout">Размещение</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panel-title">Название панели *</Label>
                  <Input
                    id="panel-title"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Введите название панели"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panel-type">Тип панели *</Label>
                  <Select
                    value={formData.type || ''}
                    onValueChange={(value) => updateFormData({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип панели" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timeseries">График временных рядов</SelectItem>
                      <SelectItem value="stat">Числовое значение</SelectItem>
                      <SelectItem value="gauge">Шкала</SelectItem>
                      <SelectItem value="table">Таблица</SelectItem>
                      <SelectItem value="barchart">Гистограмма</SelectItem>
                      <SelectItem value="piechart">Круговая диаграмма</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="panel-description">Описание</Label>
                <Textarea
                  id="panel-description"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Описание панели (необязательно)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="transparent"
                  checked={formData.transparent || false}
                  onCheckedChange={(checked) => updateFormData({ transparent: checked })}
                />
                <Label htmlFor="transparent">Прозрачный фон</Label>
              </div>
            </TabsContent>

            <TabsContent value="queries" className="space-y-4">
              <div className="space-y-4">
                {(formData.targets || []).map((target, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          Запрос {target.refId}
                          {validationResults.get(index.toString())?.isValid === true && (
                            <Badge variant="secondary" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Валидный
                            </Badge>
                          )}
                          {validationResults.get(index.toString())?.isValid === false && (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Ошибка
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex gap-2">
                          {formData.targets && formData.targets.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeTarget(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PromQLHelper
                        query={target.expr || ''}
                        onQueryChange={(query) => updateTarget(index, { expr: query })}
                        onValidate={(isValid, warnings) =>
                          handlePromQLValidation(index, isValid, warnings)
                        }
                      />

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Легенда</Label>
                          <Input
                            value={target.legendFormat || ''}
                            onChange={(e) => updateTarget(index, { legendFormat: e.target.value })}
                            placeholder="{{instance}}"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Интервал</Label>
                          <Input
                            value={target.interval || ''}
                            onChange={(e) => updateTarget(index, { interval: e.target.value })}
                            placeholder="10s, 1m, 5m"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={addTarget}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить запрос
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <Alert>
                <Palette className="h-4 w-4" />
                <AlertDescription>
                  Настройки визуализации зависят от выбранного типа панели.
                  Базовые настройки будут применены автоматически.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Основные настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* В будущем здесь будут специфичные для типа панели настройки */}
                  <div className="text-sm text-muted-foreground">
                    Расширенные настройки визуализации для типа "{formData.type}"
                    будут доступны в следующих версиях.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Ширина</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.gridPos?.w || 12}
                    onChange={(e) => updateFormData({
                      gridPos: {
                        ...formData.gridPos!,
                        w: parseInt(e.target.value) || 12
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Высота</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.gridPos?.h || 8}
                    onChange={(e) => updateFormData({
                      gridPos: {
                        ...formData.gridPos!,
                        h: parseInt(e.target.value) || 8
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Позиция X</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.gridPos?.x || 0}
                    onChange={(e) => updateFormData({
                      gridPos: {
                        ...formData.gridPos!,
                        x: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Позиция Y</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.gridPos?.y || 0}
                    onChange={(e) => updateFormData({
                      gridPos: {
                        ...formData.gridPos!,
                        y: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>

              <Alert>
                <Grid className="h-4 w-4" />
                <AlertDescription>
                  Сетка дашборда имеет ширину 24 единицы. Позиция Y будет автоматически
                  скорректирована при размещении панели.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Validation summary */}
          {validationResults.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Статус валидации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(validationResults.entries()).map(([targetIndex, result]) => (
                    <div key={targetIndex} className="flex items-center gap-2 text-sm">
                      {result.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>Запрос {String.fromCharCode(65 + parseInt(targetIndex))}: {
                        result.isValid ? 'Корректный' : 'Содержит ошибки'
                      }</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave() || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
