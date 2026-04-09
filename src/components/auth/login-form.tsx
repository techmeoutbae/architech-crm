"use client"

import { startTransition, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDashboardPath, getFriendlyAuthError, normalizeUserRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const SUPPORT_EMAIL = "support@architech.design"

async function getRoleForUser(userId: string, fallbackRole?: string | null) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  return normalizeUserRole(profile?.role ?? fallbackRole)
}

export function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message: string }>({
    type: "idle",
    message: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true

    async function checkExistingSession() {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) {
        return
      }

      if (!session?.user) {
        setCheckingSession(false)
        return
      }

      const role = await getRoleForUser(session.user.id, session.user.user_metadata?.role)

      startTransition(() => {
        router.replace(getDashboardPath(role))
      })
    }

    void checkExistingSession()

    return () => {
      active = false
    }
  }, [router])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting || checkingSession) {
      return
    }

    setSubmitting(true)
    setStatus({ type: "idle", message: "" })

    const supabase = createClient()
    const trimmedEmail = email.trim()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error || !data.user) {
      setStatus({
        type: "error",
        message: getFriendlyAuthError(error?.message),
      })
      setSubmitting(false)
      return
    }

    const role = await getRoleForUser(data.user.id, data.user.user_metadata?.role)
    setStatus({
      type: "success",
      message: "Signed in successfully. Redirecting to your workspace...",
    })

    startTransition(() => {
      router.replace(getDashboardPath(role))
    })
  }

  return (
    <div className="animate-[fade-in_450ms_ease-out]">
      <Card className="overflow-hidden rounded-[32px] border border-white/60 bg-white/[0.86] shadow-[0_32px_90px_-42px_rgba(10,23,42,0.48)] backdrop-blur-xl">
        <CardHeader className="border-b border-slate-200/70 px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c8daf8] bg-[#edf5ff] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#1b4d7e]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure sign-in
          </div>
          <CardTitle className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            Welcome back
          </CardTitle>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-slate-600">
            Sign in to view project progress, files, invoices, and delivery updates in one place.
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            <div
              aria-live="polite"
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm leading-6 transition",
                status.type === "idle" && "hidden",
                status.type === "error" && "border-red-200 bg-red-50 text-red-700",
                status.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              <div className="flex items-start gap-3">
                {status.type === "error" ? (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                ) : status.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                ) : null}
                <p>{status.message}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={submitting || checkingSession}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Password</Label>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[#235b95] transition hover:text-[#153b63]"
                >
                  Need help?
                </a>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={submitting || checkingSession}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-full px-2 text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91bbff]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={submitting || checkingSession || !email.trim() || !password}
              aria-busy={submitting || checkingSession}
            >
              {submitting || checkingSession ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {checkingSession ? "Checking access..." : "Signing in..."}
                </>
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Need portal access? Contact your account manager or support.</p>
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-[#1b4d7e] transition hover:text-[#153b63]"
              >
                {SUPPORT_EMAIL}
              </a>
              <Link href="/" className="font-semibold text-slate-500 transition hover:text-slate-700">
                Back to site
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
