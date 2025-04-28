"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { setCurrentUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    // Имитация аутентификации
    try {
      // В реальном приложении здесь будет запрос к Keycloak
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (username === "admin" && password === "admin") {
        setCurrentUser({
          id: "1",
          name: "Администратор",
          email: "admin@example.com",
          role: "admin",
        })
        router.push("/")
      } else if (username === "manager" && password === "manager") {
        setCurrentUser({
          id: "2",
          name: "Руководитель",
          email: "manager@example.com",
          role: "manager",
        })
        router.push("/")
      } else if (username === "support" && password === "support") {
        setCurrentUser({
          id: "3",
          name: "Специалист ТП",
          email: "support@example.com",
          role: "support",
        })
        router.push("/")
      } else {
        setError("Неверное имя пользователя или пароль")
      }
    } catch (error) {
      setError("Ошибка при входе в систему")
    } finally {
      setIsLoading(false)
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
          <CardDescription className="text-center">Введите ваши учетные данные для входа</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input id="username" name="username" placeholder="Введите имя пользователя" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" placeholder="Введите пароль" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
