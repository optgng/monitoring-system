"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SearchContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  isSearching: boolean
  setIsSearching: (isSearching: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, isSearching, setIsSearching }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
