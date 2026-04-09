"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { BrandLockup } from "@/components/brand/brand-lockup"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "#platform", label: "Platform" },
  { href: "#experience", label: "Experience" },
  { href: "#security", label: "Security" },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between rounded-[28px] border border-slate-200/70 bg-white/78 px-4 py-3 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandLockup theme="light" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Access portal</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "mx-auto mt-3 max-w-[1320px] overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/92 px-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.35)] backdrop-blur transition-all duration-200 lg:hidden",
          menuOpen ? "max-h-[24rem] py-4 opacity-100" : "max-h-0 border-transparent py-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Access portal</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
