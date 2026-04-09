import { redirect } from "next/navigation"
import InvoicesClient from "./invoices-client"
import { getDashboardUser } from "@/lib/dashboard-user"

export default async function InvoicesPage() {
  const userData = await getDashboardUser()

  if (!userData) {
    redirect("/login")
  }

  return <InvoicesClient userData={userData} />
}
