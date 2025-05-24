"use server"

import { dashboardApi } from "@/lib/dashboard-api"
import { revalidatePath } from "next/cache"
import type { Dashboard } from "@/lib/dashboard-api"

export async function getDashboards() {
  try {
    const response = await dashboardApi.getDashboards()
    return response
  } catch (error) {
    console.error("Failed to get dashboards:", error)
    return { status: "error", message: "Failed to load dashboards", data: [] }
  }
}

export async function createDashboard(data: Partial<Dashboard>) {
  try {
    const response = await dashboardApi.createDashboard(data)
    if (response.status === "success") {
      revalidatePath("/dashboards")
    }
    return response
  } catch (error) {
    console.error("Failed to create dashboard:", error)
    return { status: "error", message: "Failed to create dashboard" }
  }
}

export async function deleteDashboard(uid: string) {
  try {
    const response = await dashboardApi.deleteDashboard(uid)
    if (response.status === "success") {
      revalidatePath("/dashboards")
    }
    return response
  } catch (error) {
    console.error("Failed to delete dashboard:", error)
    return { status: "error", message: "Failed to delete dashboard" }
  }
}

export async function duplicateDashboard(uid: string) {
  try {
    const response = await dashboardApi.duplicateDashboard(uid)
    if (response.status === "success") {
      revalidatePath("/dashboards")
    }
    return response
  } catch (error) {
    console.error("Failed to duplicate dashboard:", error)
    return { status: "error", message: "Failed to duplicate dashboard" }
  }
}
