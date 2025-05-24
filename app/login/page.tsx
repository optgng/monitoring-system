"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)

  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const errorParam = searchParams.get("error")

  useEffect(() => {
    // Проверяем, не авторизован ли уже пользователь
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl)
      }
    })

    // Проверяем конфигурацию при загрузке страницы
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then(setConfigStatus)
      .catch(console.error)

    // Показываем ошибку из URL параметров
    if (errorParam) {
      setError(getErrorMessage(errorParam))
    }
  }, [callbackUrl, router, errorParam])

  const getErrorMessage = (error: string) => {
    const messages: Record<string, string> = {
      OAuthSignin: "Ошибка подключения к Keycloak. Проверьте настройки сервера.",
      OAuthCallback: "Ошибка обратного вызова OAuth.",
      OAuthCreateAccount: "Не удалось создать аккаунт.",
      AccessDenied: "Доступ запрещен.",
      Verification: "Ошибка верификации.",
      Configuration: "Ошибка конфигурации сервера.",
    }
    return messages[error] || "Произошла неизвестная ошибка при входе в систему."
  }

  const handleKeycloakSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("keycloak", {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError(getErrorMessage(result.error))
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError("Произошла ошибка при попытке входа в систему.")
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Вход в систему мониторинга
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Войдите с помощью вашей учетной записи
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {configStatus?.keycloak?.status === "unreachable" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Сервер Keycloak недоступен. Обратитесь к администратору.</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleKeycloakSignIn}
            disabled={isLoading || configStatus?.keycloak?.status === "unreachable"}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Подключение...
              </>
            ) : (
              "Войти через Keycloak"
            )}
          </Button>

          {process.env.NODE_ENV === "development" && configStatus && (
            <details className="mt-4">
              <summary className="text-sm text-slate-500 cursor-pointer">
                Информация о конфигурации (только для разработки)
              </summary>
              <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto">
                {JSON.stringify(configStatus, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
