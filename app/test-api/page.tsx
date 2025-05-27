"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { testDashboardsAPI } from '@/tests/api-test'

export default function TestApiPage() {
  const [log, setLog] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async () => {
    setIsRunning(true)
    setLog(['🚀 Запуск тестирования API...'])

    // Перехватываем console.log
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ')
      setLog(prev => [...prev, message])
      originalLog(...args)
    }

    console.error = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ')
      setLog(prev => [...prev, `❌ ${message}`])
      originalError(...args)
    }

    try {
      await testDashboardsAPI()
    } catch (error) {
      console.error('Ошибка при запуске теста:', error)
    } finally {
      // Восстанавливаем console.log
      console.log = originalLog
      console.error = originalError
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Тестирование API Dashboards</h1>

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Запустите тест для проверки интеграции с FastAPI Dashboards Service
        </p>
        <Button onClick={runTest} disabled={isRunning}>
          {isRunning ? "Выполняется..." : "Запустить тест"}
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-black text-green-400 font-mono text-sm">
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {log.length > 0 ? (
            log.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">Запустите тест для просмотра логов...</div>
          )}
        </div>
      </div>
    </div>
  )
}
