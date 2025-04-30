"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const error = searchParams?.get("error")

  const handleKeycloakLogin = async () => {
    setIsLoading(true)
    await signIn("keycloak", { callbackUrl })
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Вход в систему мониторинга</CardTitle>
          <CardDescription className="text-center">Войдите с помощью вашей учетной записи</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
              {error === "CredentialsSignin" ? "Неверные учетные данные" : "Произошла ошибка при входе"}
            </div>
          )}

          <Button onClick={handleKeycloakLogin} className="w-full" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти через Keycloak"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
