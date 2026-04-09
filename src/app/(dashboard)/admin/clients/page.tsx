import { redirect } from "next/navigation"
import ClientsClient from "./clients-client"
import { getDashboardUser } from "@/lib/dashboard-user"

export default async function ClientsPage() {
  const userData = await getDashboardUser()

  if (!userData) {
    redirect("/login")
  }

  return <ClientsClient userData={userData} />
}
