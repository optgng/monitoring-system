"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem("auth-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Симуляция API запроса
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Демо пользователи
    const demoUsers = [
      {
        id: "1",
        name: "Администратор",
        email: "admin@example.com",
        password: "admin",
        roles: ["admin", "user"],
      },
      {
        id: "2",
        name: "Менеджер",
        email: "manager@example.com",
        password: "manager",
        roles: ["manager", "user"],
      },
      {
        id: "3",
        name: "Пользователь",
        email: "user@example.com",
        password: "user",
        roles: ["user"],
      },
    ]

    const foundUser = demoUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const authUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        roles: foundUser.roles,
      }
      setUser(authUser)
      localStorage.setItem("auth-user", JSON.stringify(authUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
