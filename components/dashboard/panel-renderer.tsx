"use client"

import { useMemo } from "react"
import type { Panel } from "@/lib/dashboard-api"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface PanelRendererProps {
  panel: Panel
}

export function PanelRenderer({ panel }: PanelRendererProps) {
  // Генерируем демо-данные на основе типа панели
  const demoData = useMemo(() => {
    switch (panel.type) {
      case "timeseries":
        return [
          { time: "00:00", value: Math.random() * 100, value2: Math.random() * 80 },
          { time: "04:00", value: Math.random() * 100, value2: Math.random() * 80 },
          { time: "08:00", value: Math.random() * 100, value2: Math.random() * 80 },
          { time: "12:00", value: Math.random() * 100, value2: Math.random() * 80 },
          { time: "16:00", value: Math.random() * 100, value2: Math.random() * 80 },
          { time: "20:00", value: Math.random() * 100, value2: Math.random() * 80 },
          { time: "Сейчас", value: Math.random() * 100, value2: Math.random() * 80 },
        ]
      case "barchart":
        return [
          { category: "A", value: Math.random() * 100 },
          { category: "B", value: Math.random() * 100 },
          { category: "C", value: Math.random() * 100 },
          { category: "D", value: Math.random() * 100 },
          { category: "E", value: Math.random() * 100 },
        ]
      case "piechart":
        return [
          { name: "Сегмент A", value: Math.random() * 100 },
          { name: "Сегмент B", value: Math.random() * 100 },
          { name: "Сегмент C", value: Math.random() * 100 },
          { name: "Сегмент D", value: Math.random() * 100 },
        ]
      default:
        return []
    }
  }, [panel.type, panel.id])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  const renderPanelContent = () => {
    switch (panel.type) {
      case "timeseries":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name={panel.targets[0]?.legendFormat || "Серия 1"}
                strokeWidth={panel.fieldConfig?.defaults?.custom?.lineWidth || 1}
              />
              {panel.targets.length > 1 && (
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#82ca9d"
                  name={panel.targets[1]?.legendFormat || "Серия 2"}
                  strokeWidth={panel.fieldConfig?.defaults?.custom?.lineWidth || 1}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case "barchart":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Значение" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "piechart":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {demoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "stat":
        const statValue = Math.floor(Math.random() * 100)
        const unit = panel.fieldConfig?.defaults?.unit || ""
        const unitLabel = unit === "percent" ? "%" : unit === "bytes" ? "B" : ""

        return (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {statValue}
                {unitLabel}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {panel.targets[0]?.legendFormat || "Текущее значение"}
              </div>
            </div>
          </div>
        )

      case "gauge":
        const gaugeValue = Math.floor(Math.random() * 100)
        const min = panel.fieldConfig?.defaults?.min || 0
        const max = panel.fieldConfig?.defaults?.max || 100
        const percentage = ((gaugeValue - min) / (max - min)) * 100

        return (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-300"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{gaugeValue}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {panel.targets[0]?.legendFormat || "Значение датчика"}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <p>Неподдерживаемый тип панели: {panel.type}</p>
              <p className="text-sm mt-2">Панель будет отображена после реализации рендерера</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      {panel.targets.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <div className="text-center">
            <p>Нет настроенных запросов данных</p>
            <p className="text-sm mt-2">Добавьте PromQL запросы для отображения данных</p>
          </div>
        </div>
      ) : (
        renderPanelContent()
      )}

      {/* Отображение информации о запросах */}
      {panel.targets.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          <details>
            <summary className="cursor-pointer">Запросы ({panel.targets.length})</summary>
            <div className="mt-1 space-y-1">
              {panel.targets.map((target, index) => (
                <div key={target.refId} className="font-mono text-xs">
                  <span className="font-semibold">{target.refId}:</span> {target.expr || "Не настроен"}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
