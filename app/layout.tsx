import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ClientProviders from "@/components/providers/client-providers"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "Система мониторинга",
  description: "Система мониторинга сервисов и устройств",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ClientProviders session={session}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">{children}</main>
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
