import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

type UserRole = "admin" | "team" | "client"

export default async function DashboardLayout({
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
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "admin",
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
        role: (profile.role as UserRole) || "admin",
      }
    }
  } catch (e) {
    console.error("Error fetching profile:", e)
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