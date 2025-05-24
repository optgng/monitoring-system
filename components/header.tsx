import type React from "react"
import { ApiStatus } from "./api-status"

const Header: React.FC = () => {
  return (
    <header className="bg-gray-100 py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">My App</div>
          <div className="flex items-center gap-4">
            <ApiStatus />
            {/* остальные элементы заголовка */}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
