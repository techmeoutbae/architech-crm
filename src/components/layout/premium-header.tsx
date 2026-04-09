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
  X,
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
  showAddButton?: boolean
  addButtonLabel?: string
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
  showAddButton = false,
  addButtonLabel,
}: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const isClient = user?.role === "client"
  const shouldShowQuickAdd = showQuickAdd || showAddButton
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
    setMobileSearchOpen(false)
    router.push(href)
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (filteredLinks[0]) {
      navigateTo(filteredLinks[0].href)
    }
  }

  return (
    <>
      <header className="sticky top-16 z-30 border-b border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(246,249,253,0.8)_100%)] px-4 py-3.5 backdrop-blur-2xl sm:px-5 lg:top-0 lg:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="hidden items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-[#477fd8]" />
              {isClient ? "Client workspace" : "Operations workspace"}
            </div>
            {title ? (
              <h1 className="text-[1.55rem] font-semibold tracking-[-0.06em] text-slate-950 sm:mt-1 sm:text-[1.85rem] xl:text-[2.05rem]">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-1.5 max-w-[42rem] text-sm leading-6 text-slate-500 sm:text-[0.92rem]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="hidden min-w-0 flex-wrap items-center gap-2.5 md:flex xl:justify-end">
            {showSearch ? (
              <div className="relative min-w-[16rem] flex-1 lg:min-w-[19rem] xl:min-w-[22rem]">
                <form onSubmit={handleSearchSubmit}>
                  <label className="sr-only" htmlFor="workspace-search">
                    Search pages
                  </label>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="workspace-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setSearchFocused(false), 120)
                    }}
                    placeholder="Search pages"
                    className="h-11 w-full rounded-[16px] border border-slate-200/80 bg-white/88 pl-10 pr-4 text-sm text-slate-900 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.24)] outline-none transition focus:border-[#2f6fdf] focus:bg-white focus:ring-4 focus:ring-[#d8e6ff]"
                  />
                </form>

                {searchFocused ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.7rem)] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/97 p-2 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.36)] backdrop-blur-xl">
                    {filteredLinks.length > 0 ? (
                      filteredLinks.slice(0, 6).map((link) => (
                        <button
                          key={link.href}
                          type="button"
                          className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left transition hover:bg-slate-50"
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
                      <div className="rounded-[18px] px-4 py-4 text-sm text-slate-500">
                        No matching sections yet. Try projects, files, or invoices.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden h-10 rounded-[14px] border-white/70 bg-white/88 px-3.5 shadow-[0_16px_28px_-28px_rgba(15,23,42,0.3)] lg:inline-flex"
            >
              <a href="mailto:support@architech.design">
                <LifeBuoy className="h-4 w-4" />
                Support
              </a>
            </Button>

            {!isClient && shouldShowQuickAdd ? (
              <div className="relative">
                <Button
                  type="button"
                  size="sm"
                  className="h-10 rounded-[14px] px-3.5 shadow-[0_20px_34px_-24px_rgba(8,33,61,0.72)]"
                  onClick={() => setQuickAddOpen((current) => !current)}
                >
                  <Plus className="h-4 w-4" />
                  {addButtonLabel || "Create"}
                </Button>

                {quickAddOpen ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 hidden cursor-default bg-transparent md:block"
                      aria-label="Close quick actions"
                      onClick={() => setQuickAddOpen(false)}
                    />
                    <div className="absolute right-0 top-[calc(100%+0.7rem)] z-20 hidden w-[18rem] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/96 p-2 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.36)] backdrop-blur-xl md:block">
                      {quickAddOptions.map((option) => (
                        <button
                          key={option.href}
                          type="button"
                          className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left transition hover:bg-slate-50"
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
              <div className="flex items-center gap-2.5 rounded-[16px] border border-slate-200/75 bg-white/88 px-3 py-2 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.24)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-slate-950 text-sm font-semibold text-white">
                  {getInitials(user.full_name || user.email)}
                </div>
                <div className="hidden 2xl:block">
                  <div className="max-w-[11rem] truncate text-sm font-semibold text-slate-900">
                    {user.full_name || user.email}
                  </div>
                  <div className="text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                    {isClient ? "Client access" : "Internal access"}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 md:hidden">
          {showSearch ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 flex-1 justify-center rounded-[14px] border-white/70 bg-white/88 shadow-[0_16px_28px_-28px_rgba(15,23,42,0.28)]"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          ) : null}

          {!isClient && shouldShowQuickAdd ? (
            <Button
              type="button"
              size="sm"
              className="h-10 rounded-[14px] px-3.5 shadow-[0_20px_34px_-24px_rgba(8,33,61,0.72)]"
              onClick={() => setQuickAddOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {addButtonLabel || "Create"}
            </Button>
          ) : null}
        </div>
      </header>

      {mobileSearchOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/32 backdrop-blur-sm md:hidden"
            aria-label="Close mobile search"
            onClick={() => setMobileSearchOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-4 z-50 rounded-[28px] border border-white/75 bg-white/96 p-4 shadow-[0_30px_70px_-32px_rgba(15,23,42,0.42)] backdrop-blur-xl md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Workspace search
                </p>
                <p className="mt-1 text-base font-semibold tracking-[-0.03em] text-slate-950">
                  Jump to any section
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] border border-slate-200/80 bg-white text-slate-600"
                onClick={() => setMobileSearchOpen(false)}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-4" onSubmit={handleSearchSubmit}>
              <label className="sr-only" htmlFor="workspace-search-mobile">
                Search pages
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="workspace-search-mobile"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoFocus
                  placeholder="Search pages"
                  className="h-11 w-full rounded-[16px] border border-slate-200/80 bg-white/92 pl-10 pr-4 text-sm text-slate-900 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.24)] outline-none transition focus:border-[#2f6fdf] focus:bg-white focus:ring-4 focus:ring-[#d8e6ff]"
                />
              </div>
            </form>

            <div className="mt-4 flex flex-col gap-2">
              {filteredLinks.length > 0 ? (
                filteredLinks.slice(0, 6).map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    className="flex w-full items-center justify-between rounded-[18px] border border-slate-200/80 bg-slate-50/75 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                    onClick={() => navigateTo(link.href)}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{link.label}</div>
                      <div className="text-xs text-slate-500">{link.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))
              ) : (
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/75 px-4 py-4 text-sm text-slate-500">
                  No matching sections yet. Try projects, files, or invoices.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {!isClient && shouldShowQuickAdd && quickAddOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/32 backdrop-blur-sm md:hidden"
            aria-label="Close quick actions"
            onClick={() => setQuickAddOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-4 z-50 rounded-[28px] border border-white/75 bg-white/96 p-4 shadow-[0_30px_70px_-32px_rgba(15,23,42,0.42)] backdrop-blur-xl md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Quick actions
                </p>
                <p className="mt-1 text-base font-semibold tracking-[-0.03em] text-slate-950">
                  Create in one step
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] border border-slate-200/80 bg-white text-slate-600"
                onClick={() => setQuickAddOpen(false)}
                aria-label="Close quick actions"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {quickAddOptions.map((option) => (
                <button
                  key={option.href}
                  type="button"
                  className="flex w-full items-center justify-between rounded-[18px] border border-slate-200/80 bg-slate-50/75 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
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
          </div>
        </>
      ) : null}
    </>
  )
}
