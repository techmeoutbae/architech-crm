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

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  
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

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={{ width: mobile ? "280px" : "260px", background: "#0A2540", height: "100vh", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
      {mobile && (
        <button 
          onClick={() => setMobileOpen(false)}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "white", cursor: "pointer", padding: "8px" }}
        >
          <X size={24} />
        </button>
      )}
      
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", marginBottom: "24px" }}>
        <div style={{ width: "180px", height: "50px", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
          <Image 
            src="/architech-logo.png" 
            alt="Architech Designs" 
            width={180}
            height={50}
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        </div>
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
              onClick={() => mobile && setMobileOpen(false)}
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