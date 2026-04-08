import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LeadsClient from "./leads-client"

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  return <LeadsClient />
}