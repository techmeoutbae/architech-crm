import { redirect } from "next/navigation"
import ProjectsClient from "./projects-client"
import { getDashboardUser } from "@/lib/dashboard-user"

export default async function ProjectsPage() {
  const userData = await getDashboardUser()

  if (!userData) {
    redirect("/login")
  }

  return <ProjectsClient userData={userData} />
}
