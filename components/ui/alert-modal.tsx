"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = "Вы уверены?",
  description = "Это действие нельзя будет отменить.",
  confirmText = "Продолжить",
  cancelText = "Отмена",
}: AlertModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Modal title={title} description={description} isOpen={isOpen} onClose={onClose}>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button disabled={loading} variant="destructive" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
