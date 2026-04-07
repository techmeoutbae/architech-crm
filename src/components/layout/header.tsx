"use client"

import { Bell, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
  showSearch?: boolean
  showAddButton?: boolean
  addButtonLabel?: string
  onAddClick?: () => void
}

export function Header({
  title,
  subtitle,
  user,
  showSearch = false,
  showAddButton = false,
  addButtonLabel = "Add New",
  onAddClick,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="w-64 pl-9 bg-gray-50 border-gray-200"
              />
            </div>
          )}

          {showAddButton && (
            <Button onClick={onAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#3B82F6] rounded-full" />
          </Button>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback className="bg-[#0A2540] text-white text-xs">
                  {getInitials(user.full_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.full_name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}