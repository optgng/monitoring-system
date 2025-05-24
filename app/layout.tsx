import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SimpleAuthProvider } from "@/components/providers/simple-auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/providers/theme-provider"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "Система мониторинга",
  description: "Система мониторинга сервисов и устройств",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SimpleAuthProvider>
            {children}
            <Toaster />
          </SimpleAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
