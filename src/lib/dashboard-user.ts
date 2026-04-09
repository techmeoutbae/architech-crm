import { createClient } from "@/lib/supabase/server"
import { normalizeUserRole } from "@/lib/auth"
import type { UserRole } from "@/types"

export interface DashboardUser {
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
}

export async function getDashboardUser(): Promise<DashboardUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  let dashboardUser: DashboardUser = {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: normalizeUserRole(user.user_metadata?.role),
  }

  try {
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

    if (profile) {
      dashboardUser = {
        email: profile.email || user.email || "",
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: normalizeUserRole(profile.role),
      }
    }
  } catch {
    // Fall back to auth metadata when profile lookup is unavailable.
  }

  return dashboardUser
}
