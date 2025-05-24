"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const callbackUrl = searchParams?.get("callbackUrl") || "/"

  useEffect(() => {
    // Проверяем, не авторизован ли уже пользователь
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [callbackUrl, router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("keycloak", { callbackUrl })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Система мониторинга</CardTitle>
            <CardDescription>Войдите с помощью вашей учетной записи</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full h-12 text-base font-medium" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Подключение...
              </>
            ) : (
              "Войти через Keycloak"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
