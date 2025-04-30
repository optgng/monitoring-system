"use client"

import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { useSearch } from "./search-context"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface SearchInputProps {
  placeholder?: string
  className?: string
}

export function SearchInput({ placeholder = "Поиск...", className = "" }: SearchInputProps) {
  const { searchTerm, setSearchTerm, setIsSearching } = useSearch()
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const pathname = usePathname()

  // Reset search when navigating to a different page
  useEffect(() => {
    setLocalSearchTerm("")
    setSearchTerm("")
  }, [pathname, setSearchTerm])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm)
      setIsSearching(localSearchTerm.length > 0)
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearchTerm, setSearchTerm, setIsSearching])

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 w-full"
        value={localSearchTerm}
        onChange={(e) => setLocalSearchTerm(e.target.value)}
      />
    </div>
  )
}
