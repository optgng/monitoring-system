// Это упрощенная версия для демонстрации
// В реальном приложении это будет интегрировано с Keycloak

export type UserRole = "admin" | "manager" | "support"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Имитация текущего пользователя (в реальном приложении будет получаться из JWT)
let currentUser: User = {
  id: "1",
  name: "Иванов Иван",
  email: "ivanov@example.com",
  role: "admin",
}

export function getCurrentUser(): User {
  return currentUser
}

export function setCurrentUser(user: User): void {
  currentUser = user
}

export function hasPermission(permission: string): boolean {
  const role = getCurrentUser().role

  // Определяем разрешения для каждой роли
  const permissions = {
    admin: [
      "view_dashboards",
      "edit_dashboards",
      "manage_users",
      "manage_devices",
      "manage_notifications",
      "generate_reports",
    ],
    manager: ["view_dashboards", "generate_reports"],
    support: ["view_dashboards"],
  }

  return permissions[role]?.includes(permission) || false
}
