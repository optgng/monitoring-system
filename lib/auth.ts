import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export type UserRole = "admin" | "manager" | "support" | "user"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  roles: string[]
  avatar?: string
}

// Get the current user from the session
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // Determine the primary role based on the roles array
  let primaryRole: UserRole = "user"
  if (session.user.roles.includes("admin")) {
    primaryRole = "admin"
  } else if (session.user.roles.includes("manager")) {
    primaryRole = "manager"
  } else if (session.user.roles.includes("support")) {
    primaryRole = "support"
  }
  return {
    id: session.user.id || "",
    name: session.user.name || "",
    email: session.user.email || "",
    role: primaryRole,
    roles: session.user.roles || [],
    avatar: session.user.image || undefined,
  }
}

// Check if the user has a specific permission
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false

  // Define permissions for each role
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
    user: ["view_dashboards"],
  }

  // Check if the user's role has the required permission
  return permissions[user.role]?.includes(permission) || false
}

export function setCurrentUser(user: User) {
  // This is a client-side only function, so we can't directly modify the session here.
  // Instead, we can store the user in localStorage or a cookie, and then read it in the client-side components.
  if (typeof window !== "undefined") {
    localStorage.setItem("currentUser", JSON.stringify(user))
  }
}
