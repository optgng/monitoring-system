"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Star, Clock, Users } from "lucide-react"

interface Dashboard {
  uid: string
  name: string
  description: string
  tags: string[]
  starred: boolean
  lastModified: string
  author: string
}

interface DashboardSidebarProps {
  dashboards: Dashboard[]
  onDashboardSelect: (uid: string) => void
  selectedDashboard?: string
}

export function DashboardSidebar({ dashboards, onDashboardSelect, selectedDashboard }: DashboardSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState("")

  const filteredDashboards = dashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !filterTag || dashboard.tags.includes(filterTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(dashboards.flatMap((d) => d.tags)))

  return (
    <div className="w-80 border-r bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Дашборды</h2>
        <Button size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск дашбордов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter by tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Теги</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={filterTag === "" ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setFilterTag("")}
          >
            Все
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filterTag === tag ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Dashboard list */}
      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredDashboards.map((dashboard) => (
          <Card
            key={dashboard.uid}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedDashboard === dashboard.uid ? "bg-accent border-primary" : ""
            }`}
            onClick={() => onDashboardSelect(dashboard.uid)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium line-clamp-1">{dashboard.name}</CardTitle>
                {dashboard.starred && <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-2">{dashboard.description}</p>

              {/* Tags */}
              {dashboard.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dashboard.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {dashboard.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dashboard.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{dashboard.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{dashboard.lastModified}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDashboards.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Дашборды не найдены</p>
        </div>
      )}
    </div>
  )
}

export default DashboardSidebar
