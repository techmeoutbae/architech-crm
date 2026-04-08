"use client"

import Link from "next/link"
import Image from "next/image"
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
}

const navGroups = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/leads", label: "Leads", icon: TrendingUp },
      { href: "/admin/clients", label: "Clients", icon: Building2 },
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/files", label: "Files", icon: FileText },
      { href: "/admin/invoices", label: "Invoices", icon: CreditCard },
    ]
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ]
  },
]

const portalNavGroups = [
  {
    title: "Overview",
    items: [
      { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/portal/projects", label: "My Projects", icon: FolderKanban },
      { href: "/portal/files", label: "Files", icon: FileText },
      { href: "/portal/invoices", label: "Invoices", icon: CreditCard },
    ]
  },
  {
    title: "Communication",
    items: [
      { href: "/portal/messages", label: "Messages", icon: MessageSquare },
    ]
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  
  const isAdmin = user?.role === 'admin' || user?.role === 'team'
  const groups = isAdmin ? navGroups : portalNavGroups

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div 
      style={{ 
        width: mobile ? "280px" : collapsed ? "72px" : "260px", 
        background: "#0A2540", 
        height: "100vh", 
        padding: mobile ? "20px 16px" : collapsed ? "20px 12px" : "20px 16px", 
        display: "flex", 
        flexDirection: "column",
        transition: "width 0.3s ease, padding 0.3s ease"
      }}
    >
      {mobile && (
        <button 
          onClick={() => setMobileOpen(false)}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "white", cursor: "pointer", padding: "8px" }}
        >
          <X size={24} />
        </button>
      )}
      
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed && !mobile ? "center" : "flex-start", gap: "12px", padding: collapsed && !mobile ? "0" : "8px 12px", marginBottom: "24px" }}>
        <div style={{ width: collapsed && !mobile ? "40px" : "180px", height: "50px", borderRadius: "8px", overflow: "hidden", position: "relative", transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image 
            src="/architech-logo.png" 
            alt="Architech Designs" 
            width={180}
            height={50}
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed || mobile ? (
              <div style={{ 
                fontSize: "11px", 
                fontWeight: "600", 
                textTransform: "uppercase", 
                letterSpacing: "0.05em", 
                color: "rgba(255,255,255,0.35)", 
                padding: "0 12px", 
                marginBottom: "8px" 
              }}>
                {group.title}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => mobile && setMobileOpen(false)}
                    title={collapsed && !mobile ? link.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: collapsed && !mobile ? "12px" : "12px 14px",
                      borderRadius: "8px",
                      color: isActive ? "white" : "rgba(255,255,255,0.65)",
                      background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      fontWeight: isActive ? "600" : "500",
                      fontSize: "14px",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      justifyContent: collapsed && !mobile ? "center" : "flex-start",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                        e.currentTarget.style.color = "white"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.color = "rgba(255,255,255,0.65)"
                      }
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: "absolute",
                        left: "0",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px",
                        height: "20px",
                        background: "#3B82F6",
                        borderRadius: "0 2px 2px 0",
                      }} />
                    )}
                    <Icon style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                    {(!collapsed || mobile) && <span>{link.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      {!mobile && isAdmin && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px",
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: "8px",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            marginBottom: "12px",
            fontSize: "13px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)"
            e.currentTarget.style.color = "white"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)"
            e.currentTarget.style.color = "rgba(255,255,255,0.5)"
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      )}

      {/* User section */}
      <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", justifyContent: collapsed && !mobile ? "center" : "flex-start" }}>
            <div style={{ width: "36px", height: "36px", background: "#3B82F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "14px", flexShrink: 0 }}>
              {getInitials(user.full_name || user.email)}
            </div>
            {(!collapsed || mobile) && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "white", fontSize: "14px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.full_name || "User"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: collapsed && !mobile ? "center" : "flex-start",
            gap: "12px", 
            padding: "12px 14px", 
            borderRadius: "8px", 
            color: "rgba(255,255,255,0.65)", 
            background: "transparent", 
            border: "none", 
            cursor: "pointer", 
            width: "100%", 
            fontSize: "14px", 
            fontWeight: "500",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"
            e.currentTarget.style.color = "#EF4444"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "rgba(255,255,255,0.65)"
          }}
        >
          <LogOut style={{ width: "20px", height: "20px" }} />
          {(!collapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setMobileOpen(true)}
        style={{
          display: "none",
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: "100",
          padding: "10px",
          background: "#0A2540",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
        }}
        className="mobile-menu-btn"
      >
        <Menu size={24} />
      </button>

      {/* Desktop sidebar */}
      <div className="desktop-sidebar">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: "1000",
          }}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={`mobile-sidebar ${mobileOpen ? 'open' : ''}`}>
        <SidebarContent mobile />
      </div>

      <style jsx>{`
        .desktop-sidebar { display: flex; }
        .mobile-menu-btn { display: none; }
        .mobile-sidebar { 
          display: none; 
          position: fixed; 
          left: -280px; 
          top: 0; 
          z-index: 1001;
          transition: left 0.3s ease;
        }
        .mobile-sidebar.open { left: 0; }
        
        @media (max-width: 1024px) {
          .desktop-sidebar { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-sidebar { display: block; }
        }
      `}</style>
    </>
  )
}