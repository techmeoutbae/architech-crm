import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { normalizeUserRole } from "@/lib/auth"

type UserRole = "admin" | "team" | "client"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let userData: {
    email: string
    full_name: string | null
    avatar_url: string | null
    role: UserRole
  } = {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: normalizeUserRole(user.user_metadata?.role) as UserRole,
  }

  try {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profile) {
      userData = {
        email: profile.email || user.email || "",
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: normalizeUserRole(profile.role) as UserRole,
      }
    }
  } catch {
    // Silent fail - use defaults
  }

  if (userData.role !== 'client') {
    redirect("/admin/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.16),_transparent_28%),linear-gradient(180deg,#f6f9fd_0%,#eef4fb_100%)]">
      <Sidebar user={userData} />
      <main className="min-w-0 flex-1 overflow-hidden pb-28 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
