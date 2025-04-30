"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { RefreshCw } from "lucide-react"

export function SessionExpiredModal() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [session])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await signIn("keycloak", { redirect: false })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to refresh session:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Modal
      title="Сессия истекла"
      description="Ваша сессия истекла. Пожалуйста, войдите снова для продолжения работы."
      isOpen={isOpen}
      onClose={() => {}}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Обновление...
            </>
          ) : (
            "Войти снова"
          )}
        </Button>
      </div>
    </Modal>
  )
}
