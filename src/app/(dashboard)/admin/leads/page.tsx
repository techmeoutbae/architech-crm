import { redirect } from "next/navigation"
import LeadsClient from "./leads-client"
import { getDashboardUser } from "@/lib/dashboard-user"

export default async function LeadsPage() {
  const userData = await getDashboardUser()

  if (!userData) {
    redirect("/login")
  }

  return <LeadsClient userData={userData} />
}
