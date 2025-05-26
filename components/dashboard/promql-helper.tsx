"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  BookOpen,
  Search
} from 'lucide-react'
import { dashboardApi } from '@/lib/dashboard-api'
import { toast } from 'sonner'

interface PromQLHelperProps {
  query: string
  onQueryChange: (query: string) => void
  onValidate?: (isValid: boolean, warnings: string[]) => void
}

interface PromQLExample {
  title: string
  query: string
  legend: string
  description: string
}

interface PromQLExampleCategory {
  category: string
  examples: PromQLExample[]
}

export function PromQLHelper({ query, onQueryChange, onValidate }: PromQLHelperProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    warnings: string[]
  } | null>(null)
  const [examples, setExamples] = useState<PromQLExampleCategory[]>([])
  const [isLoadingExamples, setIsLoadingExamples] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Загружаем примеры PromQL при монтировании компонента
  useEffect(() => {
    loadPromQLExamples()
  }, [])

  // Автоматическая валидация при изменении запроса (с дебаунсом)
  useEffect(() => {
    if (!query.trim()) {
      setValidationResult(null)
      return
    }

    const timeoutId = setTimeout(() => {
      validatePromQLQuery(query)
    }, 500) // Дебаунс 500мс

    return () => clearTimeout(timeoutId)
  }, [query])

  const validatePromQLQuery = async (queryToValidate: string) => {
    if (!queryToValidate.trim()) return

    setIsValidating(true)
    try {
      const response = await dashboardApi.validatePromQL(queryToValidate)
      if (response.status === 'success') {
        const result = {
          valid: response.data.valid,
          warnings: response.data.warnings || []
        }
        setValidationResult(result)
        onValidate?.(result.valid, result.warnings)
      } else {
        setValidationResult({ valid: false, warnings: [response.message || 'Ошибка валидации'] })
        onValidate?.(false, [response.message || 'Ошибка валидации'])
      }
    } catch (error) {
      console.error('Ошибка валидации PromQL:', error)
      const errorMessage = 'Не удалось выполнить валидацию'
      setValidationResult({ valid: false, warnings: [errorMessage] })
      onValidate?.(false, [errorMessage])
    } finally {
      setIsValidating(false)
    }
  }

  const loadPromQLExamples = async () => {
    setIsLoadingExamples(true)
    try {
      const response = await dashboardApi.getPromQLExamples()
      if (response.status === 'success') {
        setExamples(response.data)
        // Автоматически разворачиваем первую категорию
        if (response.data.length > 0) {
          setExpandedCategories(new Set([response.data[0].category]))
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки примеров PromQL:', error)
      toast.error('Не удалось загрузить примеры PromQL')
    } finally {
      setIsLoadingExamples(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Скопировано в буфер обмена')
    } catch (error) {
      toast.error('Не удалось скопировать')
    }
  }

  const useExample = (example: PromQLExample) => {
    onQueryChange(example.query)
    toast.success(`Использован пример: ${example.title}`)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Фильтрация примеров по поисковому запросу
  const filteredExamples = examples.map(category => ({
    ...category,
    examples: category.examples.filter(example =>
      searchTerm === '' ||
      example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.query.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.examples.length > 0)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="query" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="query">Редактор запроса</TabsTrigger>
          <TabsTrigger value="examples">Примеры PromQL</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promql-query">PromQL запрос</Label>
            <Textarea
              id="promql-query"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Введите PromQL запрос..."
              className="font-mono text-sm min-h-[100px]"
            />
          </div>

          {/* Результат валидации */}
          {validationResult && (
            <Alert className={validationResult.valid ? "border-green-200" : "border-red-200"}>
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {validationResult.valid ? 'Запрос корректный' : 'Запрос содержит ошибки'}
                </AlertDescription>
              </div>
              {validationResult.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </Alert>
          )}

          {isValidating && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full"></div>
              Проверка запроса...
            </div>
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-examples">Поиск примеров</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-examples"
                placeholder="Поиск по названию, описанию или запросу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoadingExamples ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border border-gray-300 border-t-gray-600 rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Загрузка примеров...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExamples.map((category) => (
                <Card key={category.category}>
                  <Collapsible
                    open={expandedCategories.has(category.category)}
                    onOpenChange={() => toggleCategory(category.category)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{category.category}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{category.examples.length}</Badge>
                            {expandedCategories.has(category.category) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {category.examples.map((example, index) => (
                            <div key={index} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{example.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {example.description}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(example.query)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => useExample(example)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    Использовать
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-muted rounded p-2">
                                <code className="text-xs font-mono">{example.query}</code>
                              </div>
                              {example.legend && (
                                <div className="text-xs text-muted-foreground">
                                  <strong>Легенда:</strong> {example.legend}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
              {filteredExamples.length === 0 && !isLoadingExamples && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <p>Примеры не найдены</p>
                  {searchTerm && (
                    <p className="text-sm">Попробуйте изменить поисковый запрос</p>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
