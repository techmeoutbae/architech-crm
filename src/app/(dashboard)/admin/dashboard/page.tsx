import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  Users, 
  Building2, 
  FolderKanban, 
  DollarSign, 
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity,
} from "lucide-react"
import { Header } from "@/components/layout/header"

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  return profile || { 
    email: user.email || "", 
    full_name: user.user_metadata?.full_name || "Admin", 
    avatar_url: user.user_metadata?.avatar_url || null, 
    role: user.user_metadata?.role || "admin" 
  }
}

async function getStats() {
  const supabase = await createClient()
  
  const [leadsResult, clientsResult, projectsResult, invoicesResult] = await Promise.all([
    supabase.from('leads').select('id, status', { count: 'exact' }),
    supabase.from('clients').select('id, status', { count: 'exact' }),
    supabase.from('projects').select('id, status', { count: 'exact' }),
    supabase.from('invoices').select('id, amount, status, due_date'),
  ])

  const activeLeads = leadsResult.data?.filter(l => ['new', 'contacted', 'discovery', 'proposal'].includes(l.status)).length || 0
  const activeClients = clientsResult.data?.filter(c => c.status === 'active').length || 0
  const activeProjects = projectsResult.data?.filter(p => p.status !== 'completed').length || 0
  const completedProjects = projectsResult.data?.filter(p => p.status === 'completed').length || 0
  
  const totalRevenue = invoicesResult.data?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0
  const unpaidInvoices = invoicesResult.data?.filter(i => ['sent', 'overdue'].includes(i.status)).length || 0
  const overdueInvoices = invoicesResult.data?.filter(i => i.status === 'overdue').length || 0

  return {
    totalLeads: leadsResult.count || 0,
    activeLeads,
    totalClients: clientsResult.count || 0,
    activeClients,
    activeProjects,
    completedProjects,
    totalRevenue,
    unpaidInvoices,
    overdueInvoices,
  }
}

async function getLeadStats() {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('status')
  const counts: Record<string, number> = {}
  data?.forEach(lead => {
    counts[lead.status] = (counts[lead.status] || 0) + 1
  })
  return counts
}

async function getProjectStats() {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('status')
  const counts: Record<string, number> = {}
  data?.forEach(project => {
    counts[project.status] = (counts[project.status] || 0) + 1
  })
  return counts
}

async function getRecentActivity() {
  const supabase = await createClient()
  const [leads, projects, invoices] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('projects').select('*, client:clients(business_name)').order('updated_at', { ascending: false }).limit(3),
    supabase.from('invoices').select('*, client:clients(business_name)').order('created_at', { ascending: false }).limit(3),
  ])
  return { leads: leads.data || [], projects: projects.data || [], invoices: invoices.data || [] }
}

async function getUpcomingItems() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('*, client:clients(business_name)')
    .eq('status', 'overdue')
    .order('due_date', { ascending: true })
    .limit(3)

  const { data: upcomingProjects } = await supabase
    .from('projects')
    .select('*, client:clients(business_name)')
    .neq('status', 'completed')
    .not('end_date', 'is', null)
    .order('end_date', { ascending: true })
    .limit(3)

  return { overdueInvoices: overdueInvoices || [], upcomingProjects: upcomingProjects || [] }
}

const leadStatusLabels: Record<string, string> = {
  new: 'New', contacted: 'Contacted', discovery: 'Discovery', 
  proposal: 'Proposal', won: 'Won', lost: 'Lost'
}

const projectStatusLabels: Record<string, string> = {
  onboarding: 'Onboarding', planning: 'Planning', design: 'Design',
  development: 'Development', revisions: 'Revisions', launch: 'Launch', completed: 'Completed'
}

const leadStatusColors: Record<string, string> = {
  new: '#3B82F6', contacted: '#F59E0B', discovery: '#8B5CF6',
  proposal: '#F97316', won: '#10B981', lost: '#EF4444'
}

const projectStatusColors: Record<string, string> = {
  onboarding: '#3B82F6', planning: '#6366F1', design: '#8B5CF6',
  development: '#06B6D4', revisions: '#F59E0B', launch: '#F97316', completed: '#10B981'
}

function getLeadStatusClass(status: string) {
  const map: Record<string, string> = {
    new: 'badge-new', contacted: 'badge-contacted', discovery: 'badge-discovery',
    proposal: 'badge-proposal', won: 'badge-won', lost: 'badge-lost',
  }
  return map[status] || 'badge-new'
}

function formatStatus(status: string) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || status
}

export default async function AdminDashboardPage() {
  const user = await getUserData()
  if (!user) redirect("/login")

  const [stats, leadStats, projectStats, activity, upcoming] = await Promise.all([
    getStats(),
    getLeadStats(),
    getProjectStats(),
    getRecentActivity(),
    getUpcomingItems()
  ])

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's your agency overview."
        user={user}
        showSearch
        showQuickAdd
      />
      
      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stats-card-premium">
            <div className="stats-card-header">
              <div className="stats-card-icon blue">
                <TrendingUp style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
            <div className="stats-card-value">{stats.activeLeads}</div>
            <div className="stats-card-label">Active Leads</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>of {stats.totalLeads} total</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-card-header">
              <div className="stats-card-icon green">
                <Building2 style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
            <div className="stats-card-value">{stats.activeClients}</div>
            <div className="stats-card-label">Active Clients</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>of {stats.totalClients} total</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-card-header">
              <div className="stats-card-icon purple">
                <FolderKanban style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
            <div className="stats-card-value">{stats.activeProjects}</div>
            <div className="stats-card-label">Active Projects</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>{stats.completedProjects} completed</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-card-header">
              <div className="stats-card-icon orange">
                <DollarSign style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
            <div className="stats-card-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stats-card-label">Total Revenue</div>
            <div style={{ fontSize: "12px", color: stats.unpaidInvoices > 0 ? "#DC2626" : "#64748B", marginTop: "8px" }}>
              {stats.unpaidInvoices > 0 ? `${stats.unpaidInvoices} unpaid invoices` : 'All paid'}
            </div>
          </div>
        </div>

        {/* Pipelines */}
        <div style={{ marginBottom: "32px" }}>
          <h2 className="section-title" style={{ marginBottom: "16px" }}>Pipeline Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Leads Pipeline */}
            <div className="pipeline-section">
              <div className="pipeline-header">
                <h3 className="pipeline-title"><TrendingUp size={18} /> Leads Pipeline</h3>
                <Link href="/admin/leads" className="section-action">View all</Link>
              </div>
              <div className="pipeline-grid-horizontal">
                {Object.entries(leadStatusLabels).map(([status, label]) => (
                  <div key={status} className="pipeline-item">
                    <div className="pipeline-count" style={{ color: leadStatusColors[status] }}>{leadStats[status] || 0}</div>
                    <div className="pipeline-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Pipeline */}
            <div className="pipeline-section">
              <div className="pipeline-header">
                <h3 className="pipeline-title"><FolderKanban size={18} /> Projects Pipeline</h3>
                <Link href="/admin/projects" className="section-action">View all</Link>
              </div>
              <div className="pipeline-grid-horizontal">
                {Object.entries(projectStatusLabels).map(([status, label]) => (
                  <div key={status} className="pipeline-item">
                    <div className="pipeline-count" style={{ color: projectStatusColors[status] }}>{projectStats[status] || 0}</div>
                    <div className="pipeline-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="activity-grid">
          
          {/* Activity Feed */}
          <div className="activity-card">
            <div className="section-header" style={{ padding: "20px 24px" }}>
              <h2 className="section-title"><Activity size={18} /> Recent Activity</h2>
            </div>
            
            <div className="activity-list">
              {/* Leads */}
              {activity.leads.map((lead: any) => (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: "none" }}>
                  <div className="activity-item">
                    <div className="activity-icon" style={{ background: "#DBEAFE", color: "#3B82F6" }}>
                      <Users style={{ width: "18px", height: "18px" }} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">New lead added</div>
                      <div className="activity-desc">{lead.business_name} - {lead.email}</div>
                    </div>
                    <span className={`badge ${getLeadStatusClass(lead.status)}`}>{formatStatus(lead.status)}</span>
                  </div>
                </Link>
              ))}

              {/* Projects */}
              {activity.projects.map((project: any) => (
                <Link key={project.id} href={`/admin/projects/${project.id}`} style={{ textDecoration: "none" }}>
                  <div className="activity-item">
                    <div className="activity-icon" style={{ background: "#EDE9FE", color: "#8B5CF6" }}>
                      <FolderKanban style={{ width: "18px", height: "18px" }} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Project updated</div>
                      <div className="activity-desc">{project.name} - {project.client?.business_name}</div>
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>{project.progress_percentage || 0}%</span>
                  </div>
                </Link>
              ))}

              {/* Invoices */}
              {activity.invoices.map((invoice: any) => (
                <Link key={invoice.id} href={`/admin/invoices/${invoice.id}`} style={{ textDecoration: "none" }}>
                  <div className="activity-item">
                    <div className="activity-icon" style={{ background: "#D1FAE5", color: "#10B981" }}>
                      <FileText style={{ width: "18px", height: "18px" }} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Invoice created</div>
                      <div className="activity-desc">{invoice.invoice_number} - {formatCurrency(invoice.amount)}</div>
                    </div>
                    <span className={`badge badge-${invoice.status}`}>{formatStatus(invoice.status)}</span>
                  </div>
                </Link>
              ))}

              {activity.leads.length === 0 && activity.projects.length === 0 && activity.invoices.length === 0 && (
                <div className="empty-state-premium" style={{ padding: "32px" }}>
                  <div className="empty-state-title-premium">No recent activity</div>
                  <div className="empty-state-desc-premium">Activity will appear here as you use the CRM</div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Quick Actions */}
            <div className="quick-actions-card">
              <div className="quick-actions-title"><Plus size={18} /> Quick Actions</div>
              <div className="quick-actions-list">
                <Link href="/admin/leads" className="quick-action-btn">
                  <Users className="quick-action-icon" />
                  Add Lead
                </Link>
                <Link href="/admin/clients" className="quick-action-btn">
                  <Building2 className="quick-action-icon" />
                  Add Client
                </Link>
                <Link href="/admin/projects" className="quick-action-btn">
                  <FolderKanban className="quick-action-icon" />
                  New Project
                </Link>
                <Link href="/admin/files" className="quick-action-btn">
                  <Upload className="quick-action-icon" />
                  Upload File
                </Link>
                <Link href="/admin/invoices" className="quick-action-btn">
                  <FileText className="quick-action-icon" />
                  Create Invoice
                </Link>
              </div>
            </div>

            {/* Upcoming Items */}
            <div className="activity-card">
              <div className="section-header" style={{ padding: "20px 24px" }}>
                <h2 className="section-title"><Calendar size={18} /> Upcoming & Overdue</h2>
              </div>
              
              {/* Overdue Invoices */}
              {upcoming.overdueInvoices.length > 0 && (
                <div style={{ padding: "16px 24px", background: "#FEF2F2", borderBottom: "1px solid #FEE2E2" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <AlertCircle size={16} style={{ color: "#DC2626" }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#DC2626" }}>Overdue Invoices</span>
                  </div>
                  {upcoming.overdueInvoices.map((invoice: any) => (
                    <Link key={invoice.id} href={`/admin/invoices/${invoice.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>{invoice.invoice_number}</div>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>{invoice.client?.business_name}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#DC2626" }}>{formatCurrency(invoice.amount)}</div>
                          <div style={{ fontSize: "12px", color: "#DC2626" }}>Due {formatDate(invoice.due_date)}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Upcoming Projects */}
              <div style={{ padding: "16px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Clock size={16} style={{ color: "#64748B" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Upcoming Deadlines</span>
                </div>
                {upcoming.upcomingProjects.length > 0 ? (
                  upcoming.upcomingProjects.map((project: any) => (
                    <Link key={project.id} href={`/admin/projects/${project.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>{project.name}</div>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>{project.client?.business_name}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>Due {formatDate(project.end_date)}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                            <div className="progress-premium" style={{ width: "60px", height: "4px" }}>
                              <div className="progress-premium-bar" style={{ width: `${project.progress_percentage || 0}%` }} />
                            </div>
                            <span style={{ fontSize: "11px", color: "#64748B" }}>{project.progress_percentage || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div style={{ fontSize: "13px", color: "#94A3B8", textAlign: "center", padding: "16px 0" }}>
                    No upcoming deadlines
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}