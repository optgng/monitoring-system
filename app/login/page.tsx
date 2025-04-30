"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, RefreshCw, AlertCircle } from "lucide-react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { logger } from "@/lib/logger"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const error = searchParams?.get("error")

  useEffect(() => {
    // Parse error message
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("Ошибка конфигурации аутентификации")
          break
        case "AccessDenied":
          setErrorMessage("Доступ запрещен")
          break
        case "OAuthSignin":
          setErrorMessage("Ошибка подключения к серверу аутентификации")
          break
        case "CredentialsSignin":
          setErrorMessage("Неверные учетные данные")
          break
        default:
          setErrorMessage("Произошла ошибка при входе")
      }

      logger.error(`Authentication error: ${error}`)
    }
  }, [error])

  const handleKeycloakLogin = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      // Add a timeout to detect network issues
      const loginPromise = signIn("keycloak", { callbackUrl, redirect: true })

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login request timed out")), 10000)
      })

      // Race the login promise against the timeout
      await Promise.race([loginPromise, timeoutPromise])
    } catch (err) {
      logger.error("Login error:", err)
      setErrorMessage("Не удалось подключиться к серверу аутентификации. Пожалуйста, проверьте подключение к сети.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount((prev) => prev + 1)

    try {
      await handleKeycloakLogin()
    } finally {
      setIsRetrying(false)
    }
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
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ошибка входа</p>
                <p>{errorMessage}</p>
                {error === "OAuthSignin" && (
                  <p className="mt-1">
                    Возможно, сервер аутентификации недоступен или возникли проблемы с сетевым подключением.
                  </p>
                )}
              </div>
            </div>
          )}

          {retryCount > 0 && retryCount < 3 && (
            <p className="text-sm text-center text-muted-foreground">
              Попытка {retryCount} из 3. Если проблема повторяется, пожалуйста, обратитесь к администратору.
            </p>
          )}

          {retryCount >= 3 && (
            <p className="text-sm text-center text-amber-600 dark:text-amber-400">
              Превышено количество попыток. Пожалуйста, проверьте подключение к сети или обратитесь к администратору.
            </p>
          )}

          {isRetrying ? (
            <Button onClick={handleRetry} className="w-full" disabled={isLoading || retryCount >= 3}>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Повторная попытка...
            </Button>
          ) : (
            <Button onClick={handleKeycloakLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти через Keycloak"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
