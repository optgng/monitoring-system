import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Home } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-center">Доступ запрещен</CardTitle>
          <CardDescription className="text-center">
            У вас нет необходимых прав для доступа к этой странице
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Пожалуйста, обратитесь к администратору системы, если вы считаете, что это ошибка.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
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
