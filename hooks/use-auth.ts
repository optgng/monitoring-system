"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth({ required = false, redirectTo = "/login" } = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const loading = status === "loading"
  const authenticated = status === "authenticated"

  useEffect(() => {
    // If authentication is required and the user is not authenticated
    if (required && !loading && !authenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [required, loading, authenticated, redirectTo, router])

  return {
    session,
    loading,
    authenticated,
    signIn,
    signOut,
  }
}
