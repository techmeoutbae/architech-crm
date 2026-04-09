import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { getDashboardUser } from "@/lib/dashboard-user"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getDashboardUser()

  if (!userData) {
    redirect("/login")
  }

  if (userData.role === "client") {
    redirect("/portal/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(155,191,255,0.2),_transparent_28%),linear-gradient(180deg,#f7fafd_0%,#eef4fb_100%)]">
      <Sidebar user={userData} />
      <main className="relative min-w-0 flex-1 overflow-hidden pt-16 lg:pt-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(148,193,255,0.12),transparent_24%),radial-gradient(circle_at_84%_0%,rgba(226,236,249,0.76),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.34),transparent_25%)]" />
        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </main>
    </div>
  )
}
