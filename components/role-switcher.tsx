"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type User, type UserRole, getCurrentUser, setCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function RoleSwitcher() {
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUser().role)

  const switchRole = (role: UserRole) => {
    const user = getCurrentUser()
    const newUser: User = { ...user, role }
    setCurrentUser(newUser)
    setCurrentRole(role)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Роль: {currentRole === "admin" ? "Администратор" : currentRole === "manager" ? "Руководитель" : "СТП"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Переключить роль</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => switchRole("admin")}>Администратор</DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchRole("manager")}>Руководитель</DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchRole("support")}>Специалист технической поддержки</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
