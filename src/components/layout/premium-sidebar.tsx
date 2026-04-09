"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  TrendingUp,
  X,
} from "lucide-react"
import { BrandLockup } from "@/components/brand/brand-lockup"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn, getInitials } from "@/lib/utils"

interface SidebarProps {
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
}

const adminGroups = [
  {
    title: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/leads", label: "Leads", icon: TrendingUp },
      { href: "/admin/clients", label: "Clients", icon: Building2 },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/files", label: "Files", icon: FileText },
      { href: "/admin/invoices", label: "Invoices", icon: CreditCard },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
]

const portalGroups = [
  {
    title: "Overview",
    items: [{ href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Workspace",
    items: [
      { href: "/portal/projects", label: "Projects", icon: FolderKanban },
      { href: "/portal/files", label: "Files", icon: FileText },
      { href: "/portal/invoices", label: "Invoices", icon: CreditCard },
      { href: "/portal/messages", label: "Messages", icon: MessageSquare },
    ],
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const isAdmin = user?.role === "admin" || user?.role === "team"
  const groups = isAdmin ? adminGroups : portalGroups
  const mobilePrimaryLinks = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/admin/leads", label: "Leads", icon: TrendingUp },
        { href: "/admin/projects", label: "Projects", icon: FolderKanban },
        { href: "/admin/invoices", label: "Invoices", icon: CreditCard },
      ]
    : [
        { href: "/portal/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/portal/projects", label: "Projects", icon: FolderKanban },
        { href: "/portal/files", label: "Files", icon: FileText },
        { href: "/portal/invoices", label: "Invoices", icon: CreditCard },
      ]

  async function handleLogout() {
    if (signingOut) {
      return
    }

    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex lg:h-screen lg:shrink-0 lg:flex-col lg:border-r lg:border-white/10 lg:bg-[linear-gradient(180deg,#051423_0%,#071a2f_46%,#0b223a_100%)] lg:text-white lg:shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]",
          collapsed ? "lg:w-[106px]" : "lg:w-[292px]"
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
            <BrandLockup compact={collapsed} theme="dark" />
            {!collapsed ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {collapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-4 self-center text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}

          <nav className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.title}>
                {!collapsed ? (
                  <div className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    {group.title}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-col gap-1">
                  {group.items.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium transition",
                          collapsed && "justify-center px-0",
                          active
                            ? "bg-white text-slate-950 shadow-[0_18px_40px_-28px_rgba(255,255,255,0.45)]"
                            : "text-white/65 hover:bg-white/8 hover:text-white"
                        )}
                        title={collapsed ? link.label : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed ? <span>{link.label}</span> : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-semibold text-white">
                {getInitials(user?.full_name || user?.email || "AD")}
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {user?.full_name || "Architech user"}
                  </div>
                  <div className="truncate text-xs uppercase tracking-[0.16em] text-white/42">
                    {isAdmin ? "Internal access" : "Client access"}
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              variant="ghost"
              className={cn(
                "mt-3 w-full justify-start text-white/65 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center"
              )}
              onClick={handleLogout}
              disabled={signingOut}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed ? (signingOut ? "Signing out..." : "Sign out") : null}
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden">
        {mobileMenuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm"
            aria-label="Close mobile navigation"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : null}

        <div
          className={cn(
            "fixed inset-x-4 bottom-24 z-50 max-h-[70vh] overflow-hidden rounded-[30px] border border-white/75 bg-white/96 shadow-[0_32px_70px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl transition duration-200",
            mobileMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
            <BrandLockup theme="light" compact />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(70vh-5rem)] overflow-y-auto p-4">
            {groups.map((group) => (
              <div key={group.title} className="mb-5 last:mb-0">
                <div className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.title}
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {group.items.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition",
                          active
                            ? "bg-slate-950 text-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.72)]"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full justify-center"
              onClick={handleLogout}
              disabled={signingOut}
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
          <div className="pointer-events-auto rounded-[28px] border border-slate-200/80 bg-white/92 p-2 shadow-[0_26px_60px_-28px_rgba(15,23,42,0.42)] backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1">
              {mobilePrimaryLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-semibold transition",
                      active ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              <button
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-semibold transition",
                  mobileMenuOpen ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setMobileMenuOpen((current) => !current)}
                aria-label="Open more navigation options"
              >
                <Menu className="h-[18px] w-[18px]" />
                <span>More</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
