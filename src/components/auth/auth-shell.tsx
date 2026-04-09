import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  FolderKanban,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
} from "lucide-react"
import { BrandLockup } from "@/components/brand/brand-lockup"

const trustCards = [
  {
    icon: FolderKanban,
    title: "Project clarity",
    description: "Milestones, approvals, files, and delivery context stay aligned in one workspace.",
  },
  {
    icon: ReceiptText,
    title: "Billing visibility",
    description: "Invoices, payment status, and project coordination live side by side.",
  },
  {
    icon: LockKeyhole,
    title: "Secure access",
    description: "Role-aware entry points keep clients and internal teams in the right workspace.",
  },
]

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04111d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(92,157,255,0.22),_transparent_34%),radial-gradient(circle_at_82%_18%,_rgba(196,214,255,0.16),_transparent_24%),linear-gradient(180deg,_rgba(6,16,28,0.98)_0%,_rgba(5,18,31,0.92)_46%,_rgba(238,244,251,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:46px_46px] opacity-30" />
      <div className="absolute inset-y-0 left-0 w-[42%] bg-[radial-gradient(circle_at_center,_rgba(77,132,219,0.18),_transparent_68%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1540px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <section className="relative flex overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] px-6 py-6 shadow-[0_32px_80px_-42px_rgba(6,20,38,0.95)] backdrop-blur-xl sm:px-8 sm:py-8 lg:min-h-[calc(100vh-4rem)] lg:flex-[1.2] lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(122,170,255,0.22),_transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.03))]" />
          <div className="relative flex w-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <BrandLockup theme="dark" />
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
              >
                Website
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-12 max-w-[38rem] lg:mt-auto lg:pb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-[#89b4ff]" />
                Secure client access
              </div>

              <h1 className="mt-6 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.85rem]">
                A premium workspace for premium client relationships.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Architech Designs CRM brings project visibility, invoices, files, and delivery communication into one calm, high-trust experience.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-auto">
              {trustCards.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] text-[#9abfff]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold tracking-[0.01em] text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center lg:min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-[34rem]">{children}</div>
        </section>
      </div>
    </div>
  )
}
