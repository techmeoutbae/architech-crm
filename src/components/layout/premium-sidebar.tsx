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
  const allItems = groups.flatMap((group) => group.items)

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
  const activeItem = allItems.find((item) => isActive(item.href))
  const mobileContextLabel = isAdmin ? "Admin workspace" : "Client workspace"

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex lg:h-screen lg:shrink-0 lg:flex-col lg:border-r lg:border-white/8 lg:bg-[linear-gradient(180deg,#04111d_0%,#071728_38%,#0b2237_100%)] lg:text-white lg:shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]",
          collapsed ? "lg:w-[104px]" : "lg:w-[288px]"
        )}
      >
        <div className="flex h-full min-h-0 flex-col px-4 py-4">
          <div
            className={cn(
              "rounded-[24px] border border-white/10 bg-white/[0.05] p-3 shadow-[0_22px_44px_-32px_rgba(4,17,29,0.88)] backdrop-blur-sm",
              collapsed && "px-2.5"
            )}
          >
            <div className={cn("flex items-start gap-3", collapsed ? "justify-center" : "justify-between")}>
              <BrandLockup compact={collapsed} theme="dark" className={collapsed ? "" : "pr-2"} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-[14px] text-white/54 hover:bg-white/10 hover:text-white",
                  collapsed && "h-10 w-10"
                )}
                onClick={() => setCollapsed((current) => !current)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {!collapsed ? (
              <p className="mt-3 px-0.5 text-sm leading-6 text-white/46">
                Client delivery, billing, and operations in one focused workspace.
              </p>
            ) : null}
          </div>

          <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.title}>
                {!collapsed ? (
                  <div className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/32">
                    {group.title}
                  </div>
                ) : null}

                <div className="mt-2.5 flex flex-col gap-1.5">
                  {group.items.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-[18px] border px-3.5 py-3 text-sm font-medium transition-[background-color,border-color,color,transform]",
                          collapsed && "justify-center px-0",
                          active
                            ? "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.08)_100%)] text-white shadow-[0_18px_40px_-34px_rgba(6,20,38,0.86)]"
                            : "border-transparent text-white/62 hover:border-white/8 hover:bg-white/[0.06] hover:text-white"
                        )}
                        title={collapsed ? link.label : undefined}
                      >
                        {active ? (
                          <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-[linear-gradient(180deg,#73a8ff_0%,#dbe9ff_100%)]" />
                        ) : null}
                        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-white/58 group-hover:text-white")} />
                        {!collapsed ? <span>{link.label}</span> : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur-sm">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/12 text-sm font-semibold text-white">
                {getInitials(user?.full_name || user?.email || "AD")}
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {user?.full_name || "Architech user"}
                  </div>
                  <div className="truncate text-xs uppercase tracking-[0.14em] text-white/40">
                    {isAdmin ? "Internal access" : "Client access"}
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              variant="ghost"
              className={cn(
                "mt-3 h-10 w-full justify-start rounded-[16px] text-white/62 hover:bg-white/10 hover:text-white",
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
        <div className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(247,250,254,0.9)_100%)] px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-slate-200/80 bg-white/92 text-slate-700 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.26)]"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {mobileContextLabel}
                </p>
                <p className="truncate text-sm font-semibold tracking-[-0.02em] text-slate-950">
                  {activeItem?.label || "Architech CRM"}
                </p>
              </div>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-slate-200/80 bg-white/92 text-sm font-semibold text-slate-900 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.22)]">
              {getInitials(user?.full_name || user?.email || "AD")}
            </div>
          </div>
        </div>

        {mobileMenuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/38 backdrop-blur-sm"
            aria-label="Close mobile navigation"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : null}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[21rem] max-w-[calc(100vw-2rem)] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#071524_0%,#0a1d30_45%,#10263c_100%)] shadow-[0_32px_70px_-32px_rgba(2,6,23,0.75)] transition duration-200",
            mobileMenuOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-full opacity-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <BrandLockup theme="dark" />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.08] text-white/74"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {groups.map((group) => (
              <div key={group.title} className="mb-6 last:mb-0">
                <div className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/36">
                  {group.title}
                </div>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {group.items.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-[18px] border px-4 py-3 text-sm font-medium transition",
                          active
                            ? "border-[#5d8fd8]/30 bg-[linear-gradient(180deg,rgba(232,241,255,0.97)_0%,rgba(222,235,255,0.92)_100%)] text-[#123c67] shadow-[0_20px_38px_-32px_rgba(8,33,61,0.7)]"
                            : "border-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className={cn("h-5 w-5", active ? "text-[#1f5d97]" : "text-white/55")} />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/12 text-sm font-semibold text-white">
                  {getInitials(user?.full_name || user?.email || "AD")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.full_name || "Architech user"}
                  </p>
                  <p className="truncate text-xs uppercase tracking-[0.14em] text-white/40">
                    {isAdmin ? "Internal access" : "Client access"}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="mt-3 h-10 w-full justify-start rounded-[16px] text-white/68 hover:bg-white/10 hover:text-white"
                onClick={handleLogout}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
