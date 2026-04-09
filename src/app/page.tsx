import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  FileStack,
  FolderKanban,
  LockKeyhole,
  ReceiptText,
} from "lucide-react"
import { BrandLockup } from "@/components/brand/brand-lockup"
import { SiteHeader } from "@/components/marketing/site-header"
import { Button } from "@/components/ui/button"
import { getDashboardPath, normalizeUserRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

const trustSignals = [
  "Role-aware portal access",
  "Project, invoice, and file visibility",
  "High-trust delivery experience",
]

const experienceCards = [
  {
    icon: FolderKanban,
    title: "Project execution",
    description: "Milestones, progress, and approvals stay visible without clutter.",
  },
  {
    icon: ReceiptText,
    title: "Billing confidence",
    description: "Clients can review invoices and payment status in the same workspace.",
  },
  {
    icon: FileStack,
    title: "File coordination",
    description: "Deliverables and supporting documents stay attached to the work they belong to.",
  },
]

async function getSignedInPath() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  return getDashboardPath(normalizeUserRole(profile?.role ?? user.user_metadata?.role))
}

export default async function HomePage() {
  const signedInPath = await getSignedInPath()

  if (signedInPath) {
    redirect(signedInPath)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_48%,#edf2f7_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,173,255,0.22),_transparent_28%),radial-gradient(circle_at_82%_14%,_rgba(174,202,255,0.18),_transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(240,246,255,0.75))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,53,96,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,53,96,0.04)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1320px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <SiteHeader />

        <main className="flex flex-1 flex-col justify-center pb-10 pt-8 lg:pt-12">
          <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-[44rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#1b4d7e] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.26)]">
                <LockKeyhole className="h-3.5 w-3.5" />
                Premium client operating system
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[5.2rem]">
                A polished CRM that earns trust before a client says yes.
              </h1>

              <p className="mt-6 max-w-[42rem] text-lg leading-8 text-slate-600 sm:text-xl">
                Architech Designs CRM unifies project delivery, billing, and secure client collaboration into one premium workspace built for high-value engagements.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/login">
                    Access portal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#experience">Explore the experience</a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {trustSignals.map((signal) => (
                  <div
                    key={signal}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/72 px-3 py-2 text-sm font-medium text-slate-600 shadow-[0_12px_20px_-18px_rgba(15,23,42,0.35)]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#2f6fdf]" />
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 top-8 h-40 rounded-full bg-[#8bb4ff]/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(245,249,255,0.88)_100%)] p-5 shadow-[0_38px_90px_-48px_rgba(15,23,42,0.48)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between rounded-[26px] border border-slate-200/10 bg-slate-950 px-5 py-4 text-white shadow-[0_22px_36px_-30px_rgba(8,18,33,0.85)]">
                  <BrandLockup theme="dark" compact />
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/65">
                    Secure workspace
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_20px_38px_-34px_rgba(15,23,42,0.3)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Client view</p>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">Clean handoff, clear status</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Keep approvals, documents, and delivery milestones in a calm interface clients immediately trust.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-[#d5e4ff] bg-[linear-gradient(180deg,#eef5ff_0%,#f9fbff_100%)] p-5 shadow-[0_20px_38px_-34px_rgba(15,23,42,0.22)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5877a0]">Agency ops</p>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">Internal visibility without noise</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Give your team one place to manage leads, projects, invoices, and client communication.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {experienceCards.map(({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="rounded-[24px] border border-slate-200/80 bg-white/86 p-5 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.26)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4ff] text-[#1d4d80]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold tracking-[-0.02em] text-slate-950">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="experience"
            className="mt-16 grid gap-4 rounded-[36px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:grid-cols-3 sm:p-8"
          >
            {experienceCards.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-[28px] border border-slate-200/80 bg-white/88 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </section>
        </main>

        <footer
          id="security"
          className="mt-auto flex flex-col gap-4 border-t border-slate-200/70 px-2 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>&copy; {new Date().getFullYear()} Architech Designs LLC. Premium client portal and CRM.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a className="transition hover:text-slate-800" href="mailto:support@architech.design">
              support@architech.design
            </a>
            <Link className="transition hover:text-slate-800" href="/login">
              Sign in
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
