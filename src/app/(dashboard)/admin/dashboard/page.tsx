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
  AlertCircle,
  CheckCircle,
} from "lucide-react"

async function getStats() {
  const supabase = await createClient()
  
  const [leadsResult, clientsResult, projectsResult, invoicesResult] = await Promise.all([
    supabase.from('leads').select('id, status', { count: 'exact' }),
    supabase.from('clients').select('id, status', { count: 'exact' }),
    supabase.from('projects').select('id, status', { count: 'exact' }),
    supabase.from('invoices').select('id, amount, status'),
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

async function getRecentLeads() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getActiveProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(business_name)
    `)
    .neq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(5)
  return data || []
}

function getLeadStatusClass(status: string) {
  const map: Record<string, string> = {
    new: 'badge-new',
    contacted: 'badge-contacted',
    discovery: 'badge-discovery',
    proposal: 'badge-proposal',
    won: 'badge-won',
    lost: 'badge-lost',
  }
  return map[status] || 'badge-new'
}

function getProjectStatusClass(status: string) {
  const map: Record<string, string> = {
    onboarding: 'badge-onboarding',
    planning: 'badge-planning',
    design: 'badge-design',
    development: 'badge-development',
    revisions: 'badge-revisions',
    launch: 'badge-launch',
    completed: 'badge-completed',
  }
  return map[status] || 'badge-onboarding'
}

function formatStatus(status: string) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || status
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const stats = await getStats()
  const recentLeads = await getRecentLeads()
  const activeProjects = await getActiveProjects()

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here&apos;s your agency overview.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/admin/leads" className="btn-premium btn-premium-secondary">
            <Plus style={{ width: "16px", height: "16px" }} /> Add Lead
          </Link>
          <Link href="/admin/projects" className="btn-premium">
            <Plus style={{ width: "16px", height: "16px" }} /> New Project
          </Link>
        </div>
      </header>
      
      {/* Content */}
      <div className="dashboard-content">
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stats-card-premium">
            <div className="stats-card-header">
              <div className="stats-card-icon blue">
                <Users style={{ width: "22px", height: "22px" }} />
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

        {/* Main Content Grid */}
        <div className="activity-grid">
          
          {/* Active Projects */}
          <div className="activity-card">
            <div className="section-header" style={{ padding: "20px 24px" }}>
              <h2 className="section-title">Active Projects</h2>
              <Link href="/admin/projects" className="section-action">
                View all <ArrowRight style={{ width: "14px", height: "14px" }} />
              </Link>
            </div>
            
            {activeProjects.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-state-icon-premium">
                  <FolderKanban style={{ width: "32px", height: "32px" }} />
                </div>
                <div className="empty-state-title-premium">No active projects</div>
                <div className="empty-state-desc-premium">Create your first project to get started</div>
              </div>
            ) : (
              <div className="activity-list">
                {activeProjects.map((project: any) => (
                  <Link key={project.id} href={`/admin/projects/${project.id}`} style={{ textDecoration: "none" }}>
                    <div className="activity-item">
                      <div className="activity-icon" style={{ background: "#EDE9FE", color: "#8B5CF6" }}>
                        <FolderKanban style={{ width: "18px", height: "18px" }} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{project.name}</div>
                        <div className="activity-desc">{project.client?.business_name || 'No client'}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className={`badge ${getProjectStatusClass(project.status)}`}>{formatStatus(project.status)}</span>
                        <span style={{ fontSize: "12px", color: "#64748B" }}>{project.progress_percentage || 0}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="activity-card">
            <div className="section-header" style={{ padding: "20px 24px" }}>
              <h2 className="section-title">Recent Leads</h2>
              <Link href="/admin/leads" className="section-action">
                View all <ArrowRight style={{ width: "14px", height: "14px" }} />
              </Link>
            </div>
            
            {recentLeads.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-state-icon-premium">
                  <Users style={{ width: "32px", height: "32px" }} />
                </div>
                <div className="empty-state-title-premium">No leads yet</div>
                <div className="empty-state-desc-premium">Leads will appear here</div>
              </div>
            ) : (
              <div className="activity-list">
                {recentLeads.map((lead: any) => (
                  <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: "none" }}>
                    <div className="activity-item">
                      <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #3B82F6, #60A5FA)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "14px", flexShrink: 0 }}>
                        {lead.business_name?.charAt(0) || 'L'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{lead.business_name}</div>
                        <div className="activity-desc">{lead.email}</div>
                      </div>
                      <span className={`badge ${getLeadStatusClass(lead.status)}`}>{formatStatus(lead.status)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: "32px" }}>
          <h2 className="section-title" style={{ marginBottom: "20px" }}>Quick Actions</h2>
          <div className="quick-actions-list" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
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
            <Link href="/admin/invoices" className="quick-action-btn">
              <FileText className="quick-action-icon" />
              Create Invoice
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}