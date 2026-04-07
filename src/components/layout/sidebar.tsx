"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CreditCard,
  Settings,
  Building2,
  MessageSquare,
  ChevronLeft,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { getInitials } from "@/lib/utils"

interface SidebarProps {
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
  onLogout?: () => void
}

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/files", label: "Files", icon: FileText },
  { href: "/admin/invoices", label: "Invoices", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

const clientLinks = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/projects", label: "My Projects", icon: FolderKanban },
  { href: "/portal/files", label: "Files", icon: FileText },
  { href: "/portal/invoices", label: "Invoices", icon: CreditCard },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  
  const isAdmin = user?.role === 'admin' || user?.role === 'team'
  const links = isAdmin ? adminLinks : clientLinks

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-[#0A2540] text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">AD</span>
            </div>
            <span className="font-semibold text-lg">Architech</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-[#3B82F6] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {user && (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback className="bg-[#3B82F6] text-white text-sm">
                {getInitials(user.full_name || user.email)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name || "User"}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            )}
            {onLogout && !collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}