import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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

  let userData = {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "client" as const,
  }

  try {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profile) {
      userData = {
        email: profile.email || user.email || "",
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role as "admin" | "team" | "client",
      }
    }
  } catch (e) {
    // User record doesn't exist yet
  }

  if (userData.role !== 'client') {
    redirect("/admin/dashboard")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={userData} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}