import Link from "next/link"
import { redirect } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  DollarSign,
  FileText,
  FolderKanban,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import type { BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CompactStatCard } from "@/components/dashboard/compact-stat-card"
import { EmptyStateCard } from "@/components/dashboard/empty-state-card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { INVOICE_STATUS_LABELS } from "@/lib/constants"
import { getDashboardUser } from "@/lib/dashboard-user"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"

type BadgeVariant = NonNullable<BadgeProps["variant"]>
type StatTone = "blue" | "violet" | "emerald" | "amber" | "rose" | "slate" | "cyan" | "indigo"

interface LeadRecord {
  id: string
  business_name: string
  email: string
  status: string
  created_at: string
}

interface ClientRecord {
  id: string
  status: string
}

interface ProjectRecord {
  id: string
  name: string
  status: string
  progress_percentage: number | null
  end_date: string | null
  updated_at: string
  client: { business_name: string } | null
}

interface InvoiceRecord {
  id: string
  invoice_number: string
  amount: number
  status: string
  due_date: string | null
  created_at: string
  client: { business_name: string } | null
}

interface DashboardStats {
  totalLeads: number
  activeLeads: number
  totalClients: number
  activeClients: number
  activeProjects: number
  completedProjects: number
  paidRevenue: number
  outstandingRevenue: number
  overdueInvoices: number
}

interface ActivityItem {
  id: string
  href: string
  title: string
  description: string
  badgeLabel: string
  badgeVariant: BadgeVariant
  timestamp: string
  icon: LucideIcon
  iconClassName: string
}

const leadStatusConfig: Record<string, { label: string; variant: BadgeVariant; tone: StatTone }> = {
  new: { label: "New", variant: "blue", tone: "blue" },
  contacted: { label: "Contacted", variant: "warning", tone: "amber" },
  discovery: { label: "Discovery", variant: "purple", tone: "violet" },
  proposal: { label: "Proposal", variant: "secondary", tone: "slate" },
  won: { label: "Won", variant: "success", tone: "emerald" },
  lost: { label: "Lost", variant: "destructive", tone: "rose" },
}

const projectStatusConfig: Record<string, { label: string; variant: BadgeVariant; tone: StatTone }> = {
  onboarding: { label: "Onboarding", variant: "blue", tone: "blue" },
  planning: { label: "Planning", variant: "indigo", tone: "indigo" },
  design: { label: "Design", variant: "purple", tone: "violet" },
  development: { label: "Development", variant: "cyan", tone: "cyan" },
  revisions: { label: "Revisions", variant: "warning", tone: "amber" },
  launch: { label: "Launch", variant: "orange", tone: "slate" },
  completed: { label: "Completed", variant: "success", tone: "emerald" },
}

const invoiceStatusConfig: Record<string, BadgeVariant> = {
  draft: "secondary",
  sent: "blue",
  paid: "success",
  partial: "warning",
  overdue: "destructive",
}

const quickActions = [
  {
    href: "/admin/leads",
    label: "Capture lead",
    description: "Add a new opportunity to the pipeline.",
    icon: TrendingUp,
  },
  {
    href: "/admin/clients",
    label: "Create client",
    description: "Open a new account record for delivery.",
    icon: Building2,
  },
  {
    href: "/admin/projects",
    label: "Start project",
    description: "Create a delivery workspace and milestones.",
    icon: FolderKanban,
  },
  {
    href: "/admin/invoices",
    label: "Issue invoice",
    description: "Create a new billing record and follow-up cycle.",
    icon: DollarSign,
  },
] satisfies Array<{
  href: string
  label: string
  description: string
  icon: LucideIcon
}>

async function getDashboardData() {
  const supabase = await createClient()

  const [
    leadsResult,
    clientsResult,
    projectsResult,
    invoicesResult,
    recentLeadsResult,
    recentProjectsResult,
    recentInvoicesResult,
    overdueInvoicesResult,
    upcomingProjectsResult,
  ] = await Promise.all([
    supabase.from("leads").select("id, business_name, email, status, created_at", { count: "exact" }),
    supabase.from("clients").select("id, status", { count: "exact" }),
    supabase.from("projects").select("id, name, status, progress_percentage, end_date, updated_at, client:clients(business_name)"),
    supabase.from("invoices").select("id, invoice_number, amount, status, due_date, created_at, client:clients(business_name)"),
    supabase.from("leads").select("id, business_name, email, status, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("projects").select("id, name, status, progress_percentage, end_date, updated_at, client:clients(business_name)").order("updated_at", { ascending: false }).limit(4),
    supabase.from("invoices").select("id, invoice_number, amount, status, due_date, created_at, client:clients(business_name)").order("created_at", { ascending: false }).limit(4),
    supabase.from("invoices").select("id, invoice_number, amount, status, due_date, created_at, client:clients(business_name)").eq("status", "overdue").order("due_date", { ascending: true }).limit(3),
    supabase.from("projects").select("id, name, status, progress_percentage, end_date, updated_at, client:clients(business_name)").neq("status", "completed").not("end_date", "is", null).order("end_date", { ascending: true }).limit(3),
  ])

  const leads = (leadsResult.data as LeadRecord[] | null) || []
  const clients = (clientsResult.data as ClientRecord[] | null) || []
  const projects = (projectsResult.data as ProjectRecord[] | null) || []
  const invoices = (invoicesResult.data as InvoiceRecord[] | null) || []
  const recentLeads = (recentLeadsResult.data as LeadRecord[] | null) || []
  const recentProjects = (recentProjectsResult.data as ProjectRecord[] | null) || []
  const recentInvoices = (recentInvoicesResult.data as InvoiceRecord[] | null) || []
  const overdueInvoices = (overdueInvoicesResult.data as InvoiceRecord[] | null) || []
  const upcomingProjects = (upcomingProjectsResult.data as ProjectRecord[] | null) || []

  const leadCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {})

  const projectCounts = projects.reduce<Record<string, number>>((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {})

  const stats: DashboardStats = {
    totalLeads: leadsResult.count || leads.length,
    activeLeads: leads.filter((lead) =>
      ["new", "contacted", "discovery", "proposal"].includes(lead.status)
    ).length,
    totalClients: clientsResult.count || clients.length,
    activeClients: clients.filter((client) => client.status === "active").length,
    activeProjects: projects.filter((project) => project.status !== "completed").length,
    completedProjects: projects.filter((project) => project.status === "completed").length,
    paidRevenue: invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
    outstandingRevenue: invoices
      .filter((invoice) => ["sent", "partial", "overdue"].includes(invoice.status))
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
    overdueInvoices: invoices.filter((invoice) => invoice.status === "overdue").length,
  }

  const recentActivity: ActivityItem[] = [
    ...recentLeads.map((lead) => ({
      id: `lead-${lead.id}`,
      href: `/admin/leads/${lead.id}`,
      title: lead.business_name || "New lead",
      description: lead.email || "Lead record created",
      badgeLabel: leadStatusConfig[lead.status]?.label || lead.status,
      badgeVariant: leadStatusConfig[lead.status]?.variant || "secondary",
      timestamp: lead.created_at,
      icon: Users,
      iconClassName: "border-sky-200/80 bg-sky-50/90 text-sky-700",
    })),
    ...recentProjects.map((project) => ({
      id: `project-${project.id}`,
      href: `/admin/projects/${project.id}`,
      title: project.name,
      description: project.client?.business_name || "Client workspace",
      badgeLabel: projectStatusConfig[project.status]?.label || project.status,
      badgeVariant: projectStatusConfig[project.status]?.variant || "secondary",
      timestamp: project.updated_at,
      icon: FolderKanban,
      iconClassName: "border-violet-200/80 bg-violet-50/90 text-violet-700",
    })),
    ...recentInvoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      href: `/admin/invoices/${invoice.id}`,
      title: invoice.invoice_number,
      description: `${invoice.client?.business_name || "Billing record"} - ${formatCurrency(invoice.amount)}`,
      badgeLabel: INVOICE_STATUS_LABELS[invoice.status] || invoice.status,
      badgeVariant: invoiceStatusConfig[invoice.status] || "secondary",
      timestamp: invoice.created_at,
      icon: FileText,
      iconClassName: "border-emerald-200/80 bg-emerald-50/90 text-emerald-700",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)

  return {
    stats,
    leadCounts,
    projectCounts,
    recentActivity,
    overdueInvoices,
    upcomingProjects,
  }
}

export async function AdminDashboardView() {
  const user = await getDashboardUser()

  if (!user) {
    redirect("/login")
  }

  const { stats, leadCounts, projectCounts, recentActivity, overdueInvoices, upcomingProjects } =
    await getDashboardData()

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Track sales, delivery, billing, and client health in one workspace."
        user={user}
        showSearch
        showQuickAdd
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 pb-10 sm:p-5 xl:p-7">
          <section className="grid gap-4 rounded-[26px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(247,250,255,0.72)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-5 xl:grid-cols-[1.15fr_0.95fr] xl:p-6">
            <div className="max-w-[46rem]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Executive summary
              </p>
              <h2 className="mt-2.5 text-[1.75rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2rem] xl:text-[2.2rem]">
                See sales, delivery, and billing at a glance.
              </h2>
              <p className="mt-2.5 max-w-[38rem] text-sm leading-6 text-slate-500">
                Review pipeline movement, project load, collections, and recent updates without leaving the dashboard.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Badge variant="blue" className="px-3 py-1.5 text-xs">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Premium workspace
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                  {stats.activeProjects} active projects
                </Badge>
                <Badge variant={stats.overdueInvoices > 0 ? "warning" : "success"} className="px-3 py-1.5 text-xs">
                  {stats.overdueInvoices > 0 ? `${stats.overdueInvoices} invoices to review` : "Collections healthy"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div className="rounded-[18px] border border-slate-200/80 bg-white/78 p-4 shadow-[0_20px_36px_-30px_rgba(15,23,42,0.18)]">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Pipeline
                </p>
                <p className="mt-2.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-slate-950">{stats.activeLeads}</p>
                <p className="mt-1.5 text-sm text-slate-500">open opportunities</p>
              </div>
              <div className="rounded-[18px] border border-slate-200/80 bg-white/78 p-4 shadow-[0_20px_36px_-30px_rgba(15,23,42,0.18)]">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Delivery
                </p>
                <p className="mt-2.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-slate-950">{stats.activeProjects}</p>
                <p className="mt-1.5 text-sm text-slate-500">{stats.completedProjects} completed</p>
              </div>
              <div className="rounded-[18px] border border-slate-200/80 bg-white/78 p-4 shadow-[0_20px_36px_-30px_rgba(15,23,42,0.18)]">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Revenue
                </p>
                <p className="mt-2.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-slate-950">
                  {formatCurrency(stats.paidRevenue)}
                </p>
                <p className="mt-1.5 text-sm text-slate-500">paid revenue recorded</p>
              </div>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              eyebrow="Sales"
              title="Active leads"
              value={String(stats.activeLeads)}
              detail={`${stats.totalLeads} total opportunities tracked`}
              icon={TrendingUp}
              tone="blue"
            />
            <MetricCard
              eyebrow="Accounts"
              title="Active clients"
              value={String(stats.activeClients)}
              detail={`${stats.totalClients} client records in the CRM`}
              icon={Building2}
              tone="emerald"
            />
            <MetricCard
              eyebrow="Delivery"
              title="Projects in motion"
              value={String(stats.activeProjects)}
              detail={`${stats.completedProjects} projects already delivered`}
              icon={FolderKanban}
              tone="violet"
            />
            <MetricCard
              eyebrow="Collections"
              title="Collected revenue"
              value={formatCurrency(stats.paidRevenue)}
              detail={
                stats.outstandingRevenue > 0
                  ? `${formatCurrency(stats.outstandingRevenue)} still outstanding`
                  : "No outstanding invoice balance"
              }
              icon={DollarSign}
              tone={stats.outstandingRevenue > 0 ? "amber" : "slate"}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
            <Card>
              <CardHeader className="border-b border-slate-200/75 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Pipeline
                    </p>
                    <CardTitle className="mt-2">Sales and delivery stages</CardTitle>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/projects">Open operations</Link>
                  </Button>
                </div>
                <CardDescription>
                  Review pipeline counts without leaving the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold tracking-[-0.03em] text-slate-950">Lead pipeline</h3>
                      <p className="mt-1 text-sm text-slate-500">Opportunity distribution by stage.</p>
                    </div>
                    <Badge variant="secondary">{stats.activeLeads} active</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                    {Object.entries(leadStatusConfig).map(([status, config]) => (
                      <CompactStatCard
                        key={status}
                        label={config.label}
                        value={leadCounts[status] || 0}
                        detail={status === "won" ? "Closed successfully" : "Pipeline stage"}
                        tone={config.tone}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold tracking-[-0.03em] text-slate-950">Project flow</h3>
                      <p className="mt-1 text-sm text-slate-500">Delivery status by project phase.</p>
                    </div>
                    <Badge variant="secondary">{stats.activeProjects} in motion</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                    {Object.entries(projectStatusConfig).map(([status, config]) => (
                      <CompactStatCard
                        key={status}
                        label={config.label}
                        value={projectCounts[status] || 0}
                        detail={status === "completed" ? "Delivered cleanly" : "Delivery stage"}
                        tone={config.tone}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200/75 pb-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Quick actions
                </p>
                <CardTitle className="mt-2">Move the workspace forward</CardTitle>
                <CardDescription>
                  The most common actions are grouped here for faster navigation.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pt-5">
                {quickActions.map((action) => {
                  const Icon = action.icon

                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group rounded-[20px] border border-slate-200/80 bg-white/78 p-4 no-underline transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_22px_46px_-34px_rgba(15,23,42,0.24)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-slate-200/80 bg-slate-50/90 text-slate-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-950">{action.label}</p>
                            <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}

                <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Plus className="h-4 w-4 text-[#1b4d7e]" />
                    Keep the workspace moving
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use these shortcuts to update intake, delivery, and billing without digging through the CRM.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
            <Card>
              <CardHeader className="border-b border-slate-200/75 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Recent activity
                    </p>
                    <CardTitle className="mt-2">Latest workspace movement</CardTitle>
                  </div>
                  <Badge variant="secondary">{recentActivity.length} items</Badge>
                </div>
                <CardDescription>
                  New leads, project updates, and invoice events across the workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {recentActivity.length === 0 ? (
                  <div className="p-6">
                    <EmptyStateCard
                      icon={Sparkles}
                      title="No recent activity"
                      description="Once the team adds leads, updates projects, or creates invoices, the feed will appear here."
                      hint="Start with intake"
                      action={
                        <Button asChild size="sm">
                          <Link href="/admin/leads">Open leads</Link>
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200/75">
                    {recentActivity.map((item) => {
                      const Icon = item.icon

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="flex flex-col gap-3 px-5 py-4 no-underline transition hover:bg-[linear-gradient(90deg,rgba(239,246,255,0.58),rgba(255,255,255,0.92))] sm:flex-row sm:items-center sm:gap-4 sm:px-6"
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${item.iconClassName}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                              <Badge variant={item.badgeVariant}>{item.badgeLabel}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 sm:truncate">{item.description}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                              Updated
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{formatDate(item.timestamp)}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200/75 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Watchlist
                    </p>
                    <CardTitle className="mt-2">Deadlines and billing risk</CardTitle>
                  </div>
                  <Badge variant={stats.overdueInvoices > 0 ? "warning" : "secondary"}>
                    {stats.overdueInvoices > 0 ? "Needs attention" : "Healthy"}
                  </Badge>
                </div>
                <CardDescription>
                  Keep overdue invoices and upcoming deadlines visible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-slate-950">Overdue invoices</h3>
                  </div>

                  {overdueInvoices.length === 0 ? (
                    <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                      No overdue invoices right now.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {overdueInvoices.map((invoice) => (
                        <Link
                          key={invoice.id}
                          href={`/admin/invoices/${invoice.id}`}
                          className="block rounded-[18px] border border-rose-100 bg-rose-50/70 p-4 no-underline transition hover:border-rose-200 hover:bg-rose-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-950">{invoice.invoice_number}</p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {invoice.client?.business_name || "Billing record"}
                              </p>
                            </div>
                            <Badge variant="destructive">Overdue</Badge>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-rose-700">{formatCurrency(invoice.amount)}</span>
                            <span className="text-rose-600">
                              Due {invoice.due_date ? formatDate(invoice.due_date) : "date pending"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-[#1b4d7e]" />
                    <h3 className="text-sm font-semibold text-slate-950">Upcoming project deadlines</h3>
                  </div>

                  {upcomingProjects.length === 0 ? (
                    <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                      No upcoming deadlines scheduled.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/admin/projects/${project.id}`}
                          className="block rounded-[18px] border border-slate-200/80 bg-white/80 p-4 no-underline transition hover:border-slate-300 hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-950">{project.name}</p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {project.client?.business_name || "Client workspace"}
                              </p>
                            </div>
                            <Badge variant={projectStatusConfig[project.status]?.variant || "secondary"}>
                              {projectStatusConfig[project.status]?.label || project.status}
                            </Badge>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm text-slate-500">
                              <span>Progress</span>
                              <span>{project.progress_percentage || 0}%</span>
                            </div>
                            <Progress className="mt-2 h-2.5" value={project.progress_percentage || 0} />
                          </div>

                          <div className="mt-3 text-sm text-slate-500">
                            Due {project.end_date ? formatDate(project.end_date) : "date pending"}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
