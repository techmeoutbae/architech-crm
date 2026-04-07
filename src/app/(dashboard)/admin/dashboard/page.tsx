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
      <header style={{ background: "white", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#0F172A" }}>Dashboard</h1>
            <p style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>Welcome back! Here&apos;s your agency overview.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/admin/leads" style={{ padding: "10px 20px", background: "white", border: "1px solid #E2E8F0", borderRadius: "8px", fontWeight: "500", fontSize: "14px", color: "#0A2540", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus style={{ width: "16px", height: "16px" }} /> Add Lead
            </Link>
            <Link href="/admin/projects/new" style={{ padding: "10px 20px", background: "#0A2540", borderRadius: "8px", fontWeight: "500", fontSize: "14px", color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus style={{ width: "16px", height: "16px" }} /> New Project
            </Link>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <div className="stats-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", background: "#DBEAFE", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users style={{ width: "22px", height: "22px", color: "#3B82F6" }} />
              </div>
            </div>
            <div className="stats-value">{stats.activeLeads}</div>
            <div className="stats-label">Active Leads</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>of {stats.totalLeads} total</div>
          </div>

          <div className="stats-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", background: "#D1FAE5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 style={{ width: "22px", height: "22px", color: "#10B981" }} />
              </div>
            </div>
            <div className="stats-value">{stats.activeClients}</div>
            <div className="stats-label">Active Clients</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>of {stats.totalClients} total</div>
          </div>

          <div className="stats-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", background: "#EDE9FE", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FolderKanban style={{ width: "22px", height: "22px", color: "#8B5CF6" }} />
              </div>
            </div>
            <div className="stats-value">{stats.activeProjects}</div>
            <div className="stats-label">Active Projects</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>{stats.completedProjects} completed</div>
          </div>

          <div className="stats-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", background: "#FEF3C7", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign style={{ width: "22px", height: "22px", color: "#F59E0B" }} />
              </div>
            </div>
            <div className="stats-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stats-label">Total Revenue</div>
            <div style={{ fontSize: "12px", color: stats.unpaidInvoices > 0 ? "#DC2626" : "#64748B", marginTop: "8px" }}>
              {stats.unpaidInvoices > 0 ? `${stats.unpaidInvoices} unpaid invoices` : 'All paid'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          
          {/* Active Projects */}
          <div className="card-premium" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>Active Projects</h2>
              <Link href="/admin/projects" style={{ fontSize: "13px", color: "#3B82F6", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <ArrowRight style={{ width: "14px", height: "14px" }} />
              </Link>
            </div>
            
            {activeProjects.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px" }}>
                <div className="empty-state-icon">
                  <FolderKanban style={{ width: "28px", height: "28px" }} />
                </div>
                <div className="empty-state-title">No active projects</div>
                <div className="empty-state-description">Create your first project to get started</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activeProjects.map((project: any) => (
                  <Link key={project.id} href={`/admin/projects/${project.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ padding: "16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", transition: "all 0.2s", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>{project.name}</span>
                        <span className={`badge ${getProjectStatusClass(project.status)}`}>{formatStatus(project.status)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#64748B" }}>{project.client?.business_name || 'No client'}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div className="progress-premium" style={{ width: "80px" }}>
                            <div className="progress-premium-bar" style={{ width: `${project.progress_percentage || 0}%` }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>{project.progress_percentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="card-premium" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>Recent Leads</h2>
              <Link href="/admin/leads" style={{ fontSize: "13px", color: "#3B82F6", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <ArrowRight style={{ width: "14px", height: "14px" }} />
              </Link>
            </div>
            
            {recentLeads.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px" }}>
                <div className="empty-state-icon">
                  <Users style={{ width: "28px", height: "28px" }} />
                </div>
                <div className="empty-state-title">No leads yet</div>
                <div className="empty-state-description">Leads will appear here</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {recentLeads.map((lead: any) => (
                  <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", transition: "all 0.2s" }}>
                      <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #3B82F6, #60A5FA)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>
                        {lead.business_name?.charAt(0) || 'L'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "500", color: "#0F172A", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.business_name}</div>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>{lead.email}</div>
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
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <Link href="/admin/leads" style={{ textDecoration: "none" }}>
              <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", transition: "all 0.2s" }}>
                <Users style={{ width: "24px", height: "24px", color: "#3B82F6", margin: "0 auto 12px" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>Add Lead</span>
              </div>
            </Link>
            <Link href="/admin/clients" style={{ textDecoration: "none" }}>
              <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", transition: "all 0.2s" }}>
                <Building2 style={{ width: "24px", height: "24px", color: "#10B981", margin: "0 auto 12px" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>Add Client</span>
              </div>
            </Link>
            <Link href="/admin/projects" style={{ textDecoration: "none" }}>
              <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", transition: "all 0.2s" }}>
                <FolderKanban style={{ width: "24px", height: "24px", color: "#8B5CF6", margin: "0 auto 12px" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>New Project</span>
              </div>
            </Link>
            <Link href="/admin/invoices" style={{ textDecoration: "none" }}>
              <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", transition: "all 0.2s" }}>
                <FileText style={{ width: "24px", height: "24px", color: "#F59E0B", margin: "0 auto 12px" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>Create Invoice</span>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}