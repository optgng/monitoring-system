"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  FileJson,
  RefreshCw
} from 'lucide-react'
import { dashboardApi, Dashboard } from '@/lib/dashboard-api'
import { toast } from 'sonner'

interface DashboardImportExportProps {
  dashboardUid?: string
  onImportSuccess?: (dashboard: Dashboard) => void
  trigger?: React.ReactNode
}

interface ImportValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  dashboardInfo?: {
    title: string
    description?: string
    panelCount: number
    tags: string[]
  }
}

export function DashboardImportExport({
  dashboardUid,
  onImportSuccess,
  trigger
}: DashboardImportExportProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('import')

  // Import states
  const [importMethod, setImportMethod] = useState<'file' | 'json'>('file')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importJson, setImportJson] = useState('')
  const [importValidation, setImportValidation] = useState<ImportValidation | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Export states
  const [exportedDashboard, setExportedDashboard] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Валидация JSON дашборда
  const validateDashboardJson = (jsonString: string): ImportValidation => {
    try {
      const parsed = JSON.parse(jsonString)

      const errors: string[] = []
      const warnings: string[] = []

      // Базовые проверки
      if (!parsed.title) errors.push('Отсутствует название дашборда')
      if (!parsed.panels || !Array.isArray(parsed.panels)) {
        errors.push('Отсутствуют или некорректные панели')
      }

      // Проверки совместимости
      if (!parsed.schemaVersion) warnings.push('Не указана версия схемы')
      if (parsed.schemaVersion && parsed.schemaVersion < 16) {
        warnings.push('Устаревшая версия схемы, возможны проблемы совместимости')
      }

      // Проверка панелей
      if (parsed.panels) {
        parsed.panels.forEach((panel: any, index: number) => {
          if (!panel.type) warnings.push(`Панель ${index + 1}: не указан тип`)
          if (!panel.title) warnings.push(`Панель ${index + 1}: отсутствует название`)
          if (!panel.targets || panel.targets.length === 0) {
            warnings.push(`Панель ${index + 1}: отсутствуют запросы данных`)
          }
        })
      }

      const dashboardInfo = {
        title: parsed.title || 'Без названия',
        description: parsed.description,
        panelCount: (parsed.panels || []).length,
        tags: parsed.tags || []
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        dashboardInfo
      }
    } catch (error) {
      return {
        isValid: false,
        errors: ['Некорректный JSON формат'],
        warnings: []
      }
    }
  }

  // Обработка выбора файла
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFile(file)

    // Читаем содержимое файла для валидации
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        const validation = validateDashboardJson(content)
        setImportValidation(validation)
      }
    }
    reader.readAsText(file)
  }

  // Обработка изменения JSON
  const handleJsonChange = (json: string) => {
    setImportJson(json)
    if (json.trim()) {
      const validation = validateDashboardJson(json)
      setImportValidation(validation)
    } else {
      setImportValidation(null)
    }
  }

  // Импорт дашборда
  const handleImport = async () => {
    if (!importValidation?.isValid) return

    setIsImporting(true)
    try {
      let response

      if (importMethod === 'file' && importFile) {
        response = await dashboardApi.importDashboardFromFile(importFile)
      } else if (importMethod === 'json' && importJson) {
        response = await dashboardApi.importDashboard(importJson)
      } else {
        throw new Error('Не выбран файл или не введен JSON')
      }

      if (response.status === 'success') {
        toast.success('Дашборд успешно импортирован')
        onImportSuccess?.(response.data)
        setOpen(false)

        // Сброс состояния
        setImportFile(null)
        setImportJson('')
        setImportValidation(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        toast.error(response.message || 'Ошибка импорта дашборда')
      }
    } catch (error) {
      console.error('Ошибка импорта:', error)
      toast.error('Не удалось импортировать дашборд')
    } finally {
      setIsImporting(false)
    }
  }

  // Экспорт дашборда
  const handleExport = async () => {
    if (!dashboardUid) {
      toast.error('Не указан UID дашборда для экспорта')
      return
    }

    setIsExporting(true)
    try {
      const response = await dashboardApi.exportDashboard(dashboardUid)
      if (response.status === 'success') {
        setExportedDashboard(response.data)
        toast.success('Дашборд успешно экспортирован')
      } else {
        toast.error(response.message || 'Ошибка экспорта дашборда')
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      toast.error('Не удалось экспортировать дашборд')
    } finally {
      setIsExporting(false)
    }
  }

  // Скачивание файла
  const downloadDashboard = () => {
    if (!exportedDashboard) return

    const dataStr = JSON.stringify(exportedDashboard, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-${exportedDashboard.title || 'export'}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Файл загружен')
  }

  // Копирование JSON
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Скопировано в буфер обмена')
    } catch (error) {
      toast.error('Не удалось скопировать')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Импорт/Экспорт
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Импорт и экспорт дашбордов</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </TabsTrigger>
            <TabsTrigger value="export" disabled={!dashboardUid}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <Label>Способ импорта</Label>
              <Tabs value={importMethod} onValueChange={setImportMethod as any}>
                <TabsList>
                  <TabsTrigger value="file">
                    <FileJson className="h-4 w-4 mr-2" />
                    Загрузить файл
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <FileText className="h-4 w-4 mr-2" />
                    Вставить JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-3">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <FileJson className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Выберите JSON файл дашборда
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Выбрать файл
                    </Button>
                    {importFile && (
                      <p className="text-sm mt-2 font-medium">{importFile.name}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-3">
                  <Label htmlFor="dashboard-json">JSON дашборда</Label>
                  <Textarea
                    id="dashboard-json"
                    value={importJson}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder="Вставьте JSON конфигурацию дашборда..."
                    className="font-mono text-sm min-h-[200px]"
                  />
                </TabsContent>
              </Tabs>

              {/* Результат валидации */}
              {importValidation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {importValidation.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      Результат валидации
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {importValidation.dashboardInfo && (
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                        <div>
                          <Label className="text-xs">Название</Label>
                          <p className="text-sm">{importValidation.dashboardInfo.title}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Панелей</Label>
                          <p className="text-sm">{importValidation.dashboardInfo.panelCount}</p>
                        </div>
                        {importValidation.dashboardInfo.description && (
                          <div className="col-span-2">
                            <Label className="text-xs">Описание</Label>
                            <p className="text-sm">{importValidation.dashboardInfo.description}</p>
                          </div>
                        )}
                        {importValidation.dashboardInfo.tags.length > 0 && (
                          <div className="col-span-2">
                            <Label className="text-xs">Теги</Label>
                            <div className="flex gap-1 mt-1">
                              {importValidation.dashboardInfo.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {importValidation.errors.length > 0 && (
                      <Alert className="border-red-200">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Ошибки:</p>
                            {importValidation.errors.map((error, index) => (
                              <p key={index} className="text-sm">• {error}</p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {importValidation.warnings.length > 0 && (
                      <Alert className="border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Предупреждения:</p>
                            {importValidation.warnings.map((warning, index) => (
                              <p key={index} className="text-sm">• {warning}</p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!importValidation?.isValid || isImporting}
                  className="min-w-[120px]"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Импорт...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Импортировать
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  size="lg"
                  className="min-w-[160px]"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Экспорт...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Экспортировать дашборд
                    </>
                  )}
                </Button>
              </div>

              {exportedDashboard && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      Экспортированный дашборд
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(exportedDashboard, null, 2))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Копировать
                        </Button>
                        <Button
                          size="sm"
                          onClick={downloadDashboard}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Скачать
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                        <div>
                          <Label className="text-xs">Название</Label>
                          <p className="text-sm">{exportedDashboard.title}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Панелей</Label>
                          <p className="text-sm">{(exportedDashboard.panels || []).length}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">JSON конфигурация</Label>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-60 mt-1">
                          {JSON.stringify(exportedDashboard, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
