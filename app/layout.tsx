import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ClientProviders from "@/components/providers/client-providers"
import { SessionRefresh } from "@/components/session-refresh"
import { SessionExpiredModal } from "@/components/session-expired-modal"
import AuthLayout from "@/components/auth-layout"
import { Toaster } from "@/components/ui/toaster"

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
          <SessionRefresh />
          <SessionExpiredModal />
          <AuthLayout>{children}</AuthLayout>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
