"use client"

import { useDeferredValue, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  ChevronRight,
  LifeBuoy,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/utils"

interface HeaderProps {
  title?: string
  subtitle?: string
  user?: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
  } | null
  showSearch?: boolean
  showQuickAdd?: boolean
}

interface QuickLink {
  href: string
  label: string
  description: string
}

const adminQuickLinks: QuickLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", description: "Agency overview and activity" },
  { href: "/admin/leads", label: "Leads", description: "Pipeline and outreach" },
  { href: "/admin/clients", label: "Clients", description: "Relationships and accounts" },
  { href: "/admin/projects", label: "Projects", description: "Delivery and milestones" },
  { href: "/admin/files", label: "Files", description: "Secure documents and assets" },
  { href: "/admin/invoices", label: "Invoices", description: "Billing and payment status" },
  { href: "/admin/settings", label: "Settings", description: "Workspace configuration" },
]

const portalQuickLinks: QuickLink[] = [
  { href: "/portal/dashboard", label: "Dashboard", description: "Your workspace overview" },
  { href: "/portal/projects", label: "Projects", description: "Track current delivery" },
  { href: "/portal/files", label: "Files", description: "Access shared assets" },
  { href: "/portal/invoices", label: "Invoices", description: "Review billing and payments" },
  { href: "/portal/messages", label: "Messages", description: "Project communication" },
]

const quickAddOptions = [
  { label: "Add lead", href: "/admin/leads", description: "Capture a new opportunity" },
  { label: "Add client", href: "/admin/clients", description: "Create a client record" },
  { label: "New project", href: "/admin/projects", description: "Start a delivery workspace" },
  { label: "Create invoice", href: "/admin/invoices", description: "Open a billing record" },
]

export function Header({
  title,
  subtitle,
  user,
  showSearch = true,
  showQuickAdd = true,
}: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const isClient = user?.role === "client"
  const quickLinks = isClient ? portalQuickLinks : adminQuickLinks
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase()
  const filteredLinks = normalizedQuery
    ? quickLinks.filter((link) =>
        `${link.label} ${link.description}`.toLowerCase().includes(normalizedQuery)
      )
    : quickLinks.slice(0, 5)

  function navigateTo(href: string) {
    setSearchQuery("")
    setSearchFocused(false)
    setQuickAddOpen(false)
    router.push(href)
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (filteredLinks[0]) {
      navigateTo(filteredLinks[0].href)
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/78 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-[#4e8cf0]" />
            {isClient ? "Client workspace" : "Operations workspace"}
          </div>
          {title ? (
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2rem]">
              {title}
            </h1>
          ) : null}
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {showSearch ? (
            <div className="relative hidden min-w-[18rem] flex-1 md:block xl:min-w-[22rem]">
              <form onSubmit={handleSearchSubmit}>
                <label className="sr-only" htmlFor="workspace-search">
                  Search pages
                </label>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="workspace-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    window.setTimeout(() => setSearchFocused(false), 120)
                  }}
                  placeholder="Jump to leads, projects, invoices, files…"
                  className="h-11 w-full rounded-2xl border border-slate-200/80 bg-slate-50/75 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#2f6fdf] focus:bg-white focus:ring-4 focus:ring-[#d8e6ff]"
                />
              </form>

              {searchFocused ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/96 p-2 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.42)] backdrop-blur-xl">
                  {filteredLinks.length > 0 ? (
                    filteredLinks.slice(0, 6).map((link) => (
                      <button
                        key={link.href}
                        type="button"
                        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                        onMouseDown={() => navigateTo(link.href)}
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{link.label}</div>
                          <div className="text-xs text-slate-500">{link.description}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl px-4 py-4 text-sm text-slate-500">
                      No matching sections yet. Try “projects”, “files”, or “invoices”.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <a href="mailto:support@architech.design">
              <LifeBuoy className="h-4 w-4" />
              Support
            </a>
          </Button>

          {!isClient && showQuickAdd ? (
            <div className="relative">
              <Button type="button" onClick={() => setQuickAddOpen((current) => !current)}>
                <Plus className="h-4 w-4" />
                Create
              </Button>

              {quickAddOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default bg-transparent"
                    aria-label="Close quick actions"
                    onClick={() => setQuickAddOpen(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-[19rem] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/96 p-2 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.42)] backdrop-blur-xl">
                    {quickAddOptions.map((option) => (
                      <button
                        key={option.href}
                        type="button"
                        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                        onClick={() => navigateTo(option.href)}
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.description}</div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {user ? (
            <div className="flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white/88 px-3 py-2 shadow-[0_18px_28px_-26px_rgba(15,23,42,0.35)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                {getInitials(user.full_name || user.email)}
              </div>
              <div className="hidden xl:block">
                <div className="max-w-[12rem] truncate text-sm font-semibold text-slate-900">
                  {user.full_name || user.email}
                </div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {isClient ? "Client access" : "Internal access"}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showSearch ? (
        <div className="mt-3 md:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigateTo(quickLinks[0]?.href ?? "/")}
          >
            <Search className="h-4 w-4" />
            Browse workspace pages
          </Button>
        </div>
      ) : null}
    </header>
  )
}
