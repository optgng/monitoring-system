import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Система мониторинга",
  description: "Система мониторинга сервисов и устройств",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
