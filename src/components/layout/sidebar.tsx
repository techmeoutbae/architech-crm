"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CreditCard,
  Settings,
  Building2,
  MessageSquare,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const isAdmin = user?.role === 'admin' || user?.role === 'team'
  const links = isAdmin ? [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/clients", label: "Clients", icon: Building2 },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/files", label: "Files", icon: FileText },
    { href: "/admin/invoices", label: "Invoices", icon: CreditCard },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ] : [
    { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/projects", label: "My Projects", icon: FolderKanban },
    { href: "/portal/files", label: "Files", icon: FileText },
    { href: "/portal/invoices", label: "Invoices", icon: CreditCard },
    { href: "/portal/messages", label: "Messages", icon: MessageSquare },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div style={{ width: "260px", background: "#0A2540", height: "100vh", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", marginBottom: "24px" }}>
        <div style={{ width: "36px", height: "36px", background: "#3B82F6", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>AD</span>
        </div>
        <span style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Architech</span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "8px",
                color: isActive ? "white" : "rgba(255,255,255,0.7)",
                background: isActive ? "#3B82F6" : "transparent",
                fontWeight: "500",
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <Icon style={{ width: "20px", height: "20px" }} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "#3B82F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>
              {getInitials(user.full_name || user.email)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "white", fontSize: "14px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.full_name || "User"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", background: "transparent", border: "none", cursor: "pointer", width: "100%", fontSize: "14px", fontWeight: "500" }}
        >
          <LogOut style={{ width: "20px", height: "20px" }} />
          Sign out
        </button>
      </div>
    </div>
  )
}