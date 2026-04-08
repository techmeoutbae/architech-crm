import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InvoicesClient from "./invoices-client"

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  return profile || { email: user.email || "", full_name: user.user_metadata?.full_name || "Admin", avatar_url: user.user_metadata?.avatar_url || null, role: "admin" }
}

export default async function InvoicesPage() {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  return <InvoicesClient userData={userData} />
}