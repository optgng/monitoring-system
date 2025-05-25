"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ReportsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<string>("excel")
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const reports = [
    {
      id: 1,
      title: "Отчет о производительности серверов",
      description: "Данные о загрузке CPU и RAM",
      date: "01.04.2025 - 30.04.2025",
      status: "completed",
      type: "performance",
    },
    {
      id: 2,
      title: "Отчет о доступности сервисов",
      description: "Данные о времени работы и простоя",
      date: "01.03.2025 - 31.03.2025",
      status: "completed",
      type: "availability",
    },
    {
      id: 3,
      title: "Отчет об инцидентах",
      description: "Список всех инцидентов за период",
      date: "01.02.2025 - 28.02.2025",
      status: "completed",
      type: "incidents",
    },
  ]

  const generateReport = () => {
    if (!date || !endDate) return

    setIsGenerating(true)

    // Имитация генерации отчета
    setTimeout(() => {
      setIsGenerating(false)
      // Здесь можно добавить логику для добавления нового отчета в список
    }, 2000)
  }

  const handleExport = (report) => {
    setSelectedReport(report)
    setIsExportModalOpen(true)
  }

  const confirmExport = () => {
    // Здесь будет логика экспорта отчета
    setIsExportModalOpen(false)

    // Имитация скачивания файла
    setTimeout(() => {
      const link = document.createElement("a")
      link.href = "#"
      link.download = `report-${selectedReport.id}.${exportFormat === "excel" ? "xlsx" : "pdf"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 500)
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Отчеты</h1>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Сформировать отчет</TabsTrigger>
          <TabsTrigger value="history">История отчетов</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Генерация нового отчета</CardTitle>
              <CardDescription>Выберите параметры для формирования отчета</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип отчета</Label>
                  <Select defaultValue="performance">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип отчета" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Производительность серверов</SelectItem>
                      <SelectItem value="availability">Доступность сервисов</SelectItem>
                      <SelectItem value="incidents">Инциденты</SelectItem>
                      <SelectItem value="resources">Использование ресурсов</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Устройства</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите устройства" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все устройства</SelectItem>
                      <SelectItem value="servers">Серверы</SelectItem>
                      <SelectItem value="network">Сетевое оборудование</SelectItem>
                      <SelectItem value="storage">Хранилища</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Начальная дата</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Конечная дата</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: ru }) : "Выберите дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={generateReport} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    "Сформировать отчет"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История отчетов</CardTitle>
              <CardDescription>Список ранее сгенерированных отчетов</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Период</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        {report.status === "completed" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Готов
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            В процессе
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(report)}
                          disabled={report.status !== "completed"}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Экспорт
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальное окно экспорта отчета */}
      <Modal
        title="Экспорт отчета"
        description="Выберите формат для экспорта отчета"
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      >
        <div className="space-y-4 py-2 pb-4">
          <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel" className="flex items-center">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel (.xlsx)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                PDF (.pdf)
              </Label>
            </div>
          </RadioGroup>

          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmExport}>Экспортировать</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
