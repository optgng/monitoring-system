"use client"

import type React from "react"

import SessionProvider from "./session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { SearchProvider } from "@/components/search/search-context"

export default function ClientProviders({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="monitoring-theme"
      >
        <SearchProvider>{children}</SearchProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
