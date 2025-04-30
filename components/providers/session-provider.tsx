"use client"

import type React from "react"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { handleSessionError } from "@/lib/auth-utils"

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const router = useRouter()

  // Check for session errors on initial load
  useEffect(() => {
    if (session?.error) {
      handleSessionError(session)
    }
  }, [session])

  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}
