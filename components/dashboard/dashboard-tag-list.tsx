"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getTagColorWithPresets, getTagHoverClass } from "@/lib/tag-colors"
import { AllTagsModal } from "./all-tags-modal"

interface DashboardTagListProps {
  tags: string[]
  dashboardTitle: string
  maxVisible?: number
  onTagClick?: (tag: string) => void
  className?: string
}

export function DashboardTagList({
  tags,
  dashboardTitle,
  maxVisible = 3,
  onTagClick,
  className = ""
}: DashboardTagListProps) {
  const [isAllTagsModalOpen, setIsAllTagsModalOpen] = useState(false)

  if (!tags || tags.length === 0) {
    return null
  }

  const visibleTags = tags.slice(0, maxVisible)
  const hiddenCount = tags.length - maxVisible

  const handleTagClick = (tag: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (onTagClick) {
      onTagClick(tag)
    }
  }

  const handleShowAllTags = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsAllTagsModalOpen(true)
  }

  return (
    <>
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {visibleTags.map((tag) => {
          const colorClass = getTagColorWithPresets(tag)
          const hoverClass = getTagHoverClass(tag)
          return (
            <Badge
              key={tag}
              variant="outline"
              className={`text-xs cursor-pointer ${colorClass.bg} ${colorClass.text} ${colorClass.border} border-0 font-medium ${hoverClass}`}
              onClick={(e) => handleTagClick(tag, e)}
            >
              {tag}
            </Badge>
          )
        })}
        {hiddenCount > 0 && (
          <Badge
            variant="outline"
            className="text-xs bg-blue-500 text-white border-blue-500 cursor-pointer hover:bg-blue-600 transition-colors font-medium"
            onClick={handleShowAllTags}
          >
            +{hiddenCount}
          </Badge>
        )}
      </div>

      <AllTagsModal
        isOpen={isAllTagsModalOpen}
        onClose={() => setIsAllTagsModalOpen(false)}
        dashboardTitle={dashboardTitle}
        tags={tags}
        onTagSelect={onTagClick}
      />
    </>
  )
}
