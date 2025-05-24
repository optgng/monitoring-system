"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

const errorMessages = {
  Configuration: "Ошибка конфигурации сервера. Обратитесь к администратору.",
  AccessDenied: "Доступ запрещен. У вас нет прав для входа в систему.",
  Verification: "Ошибка верификации. Попробуйте войти снова.",
  Default: "Произошла ошибка при входе в систему.",
  OAuthSignin: "Ошибка подключения к Keycloak. Проверьте настройки сервера.",
  OAuthCallback: "Ошибка обратного вызова OAuth. Проверьте конфигурацию.",
  OAuthCreateAccount: "Не удалось создать аккаунт через OAuth.",
  EmailCreateAccount: "Не удалось создать аккаунт с email.",
  Callback: "Ошибка callback URL.",
  OAuthAccountNotLinked: "Аккаунт OAuth не связан с существующим аккаунтом.",
  EmailSignin: "Ошибка входа через email.",
  CredentialsSignin: "Неверные учетные данные.",
  SessionRequired: "Требуется авторизация для доступа к этой странице.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") as keyof typeof errorMessages

  const errorMessage = errorMessages[error] || errorMessages.Default

  const handleRetry = () => {
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold">Ошибка аутентификации</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Код ошибки: <code className="font-mono">{error}</code>
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Попробовать снова
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Link>
            </Button>
          </div>

          {error === "OAuthSignin" && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Возможные причины:</strong>
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 list-disc list-inside">
                <li>Неверные настройки Keycloak</li>
                <li>Недоступен сервер Keycloak</li>
                <li>Неправильный NEXTAUTH_URL</li>
                <li>Проблемы с сетевым подключением</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
