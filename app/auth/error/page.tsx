"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    // Parse and display more user-friendly error messages
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorDetails("Ошибка конфигурации аутентификации. Пожалуйста, обратитесь к администратору.")
          break
        case "AccessDenied":
          setErrorDetails("Доступ запрещен. У вас нет прав для входа в систему.")
          break
        case "Verification":
          setErrorDetails("Ошибка верификации. Ссылка для входа недействительна или истекла.")
          break
        case "OAuthSignin":
          setErrorDetails("Ошибка при начале процесса аутентификации. Возможно, проблемы с подключением к серверу.")
          break
        case "OAuthCallback":
          setErrorDetails("Ошибка при обработке ответа от сервера аутентификации.")
          break
        case "OAuthCreateAccount":
          setErrorDetails("Не удалось создать учетную запись в системе аутентификации.")
          break
        case "EmailCreateAccount":
          setErrorDetails("Не удалось создать учетную запись с указанным email.")
          break
        case "Callback":
          setErrorDetails("Ошибка при обработке ответа от сервера аутентификации.")
          break
        case "OAuthAccountNotLinked":
          setErrorDetails("Учетная запись уже связана с другим способом входа.")
          break
        case "EmailSignin":
          setErrorDetails("Ошибка при отправке email для входа.")
          break
        case "CredentialsSignin":
          setErrorDetails("Неверные учетные данные. Пожалуйста, проверьте логин и пароль.")
          break
        case "SessionRequired":
          setErrorDetails("Для доступа к этой странице требуется вход в систему.")
          break
        default:
          setErrorDetails("Произошла неизвестная ошибка при аутентификации. Пожалуйста, попробуйте снова позже.")
      }
    }
  }, [error])

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount((prev) => prev + 1)

    try {
      await signIn("keycloak", { callbackUrl: "/" })
    } catch (err) {
      console.error("Error during retry:", err)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl text-center">Ошибка аутентификации</CardTitle>
          <CardDescription className="text-center">Произошла ошибка при попытке входа в систему</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md text-sm">
            <p className="font-medium">Детали ошибки:</p>
            <p className="mt-1">{errorDetails}</p>
            {error === "OAuthSignin" && (
              <p className="mt-2">
                Возможно, сервер аутентификации недоступен или возникли проблемы с сетевым подключением.
              </p>
            )}
          </div>

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
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {retryCount < 3 && (
            <Button onClick={handleRetry} className="w-full" disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Повторная попытка...
                </>
              ) : (
                "Попробовать снова"
              )}
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Вернуться на главную
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
