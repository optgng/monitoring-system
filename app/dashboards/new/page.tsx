"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Dashboard {
  name: string
  description: string
  uid?: string // Optional UID, might be generated on the server
}

const NewDashboardPage = () => {
  const [dashboard, setDashboard] = useState<Dashboard>({
    name: "",
    description: "",
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDashboard({ ...dashboard, [name]: value })
  }

  const handleSaveDashboard = (dashboard: Dashboard) => {
    console.log("Creating dashboard:", dashboard)
    // В реальном приложении здесь был бы API-запрос на создание дашборда
    router.push(`/dashboards/${dashboard.uid || "new-dashboard"}`)
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Create New Dashboard</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Dashboard Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            name="name"
            type="text"
            placeholder="Enter dashboard name"
            value={dashboard.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            placeholder="Enter dashboard description"
            value={dashboard.description}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => handleSaveDashboard(dashboard)}
          >
            Create Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewDashboardPage
