import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

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
    role: "client",
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
        role: (profile.role as UserRole) || "client",
      }
    }
  } catch (e) {
    // Silent fail - use defaults
  }

  if (userData.role !== 'client') {
    redirect("/admin/dashboard")
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8FAFC" }}>
      <Sidebar user={userData} />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  )
}