"use client"

import { useRouter } from "next/router"
import type React from "react"

interface OverviewProps {
  uid: string // Use uid instead of id
  name: string
  description: string
}

const Overview: React.FC<OverviewProps> = ({ uid, name, description }) => {
  const router = useRouter()

  const handleDashboardClick = () => {
    router.push(`/dashboards/${uid}`) // Use uid instead of id
  }

  return (
    <div
      onClick={handleDashboardClick}
      style={{ cursor: "pointer", border: "1px solid #ccc", padding: "10px", margin: "10px" }}
    >
      <h3>{name}</h3>
      <p>{description}</p>
      <p>Dashboard UID: {uid}</p> {/* Display the UID */}
    </div>
  )
}

export { Overview }
export default Overview
