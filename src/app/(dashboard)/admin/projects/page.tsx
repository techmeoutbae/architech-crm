import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"
import { FolderKanban, Plus, ArrowRight, Building2 } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  planning: 'Planning',
  design: 'Design',
  development: 'Development',
  revisions: 'Revisions',
  launch: 'Launch',
  completed: 'Completed',
}

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
  growth: 'Growth',
  custom: 'Custom',
}

function getStatusClass(status: string) {
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

function getPackageClass(pkg: string) {
  const map: Record<string, string> = {
    basic: 'badge-inactive',
    premium: 'badge-new',
    growth: 'badge-won',
    custom: 'badge-discovery',
  }
  return map[pkg] || 'badge-inactive'
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, business_name)
    `)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const projects = await getProjects()

  const statusCounts = projects.reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  return (
    <>
      {/* Page Header */}
      <header style={{ background: "white", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#0F172A" }}>Projects</h1>
            <p style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>Track and manage client projects</p>
          </div>
          <button style={{ padding: "10px 20px", background: "#0A2540", borderRadius: "8px", fontWeight: "500", fontSize: "14px", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus style={{ width: "16px", height: "16px" }} /> New Project
          </button>
        </div>
      </header>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        
        {/* Status Pipeline */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="card-premium" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>{statusCounts[status] || 0}</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="card-premium" style={{ padding: "48px", textAlign: "center" }}>
            <div className="empty-state-icon">
              <FolderKanban style={{ width: "28px", height: "28px" }} />
            </div>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-description">Create your first project to get started</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {projects.map((project: any) => (
              <Link key={project.id} href={`/admin/projects/${project.id}`} style={{ textDecoration: "none" }}>
                <div className="card-premium" style={{ padding: "20px", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontWeight: "600", color: "#0F172A", fontSize: "16px", marginBottom: "4px" }}>{project.name}</div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>{project.client?.business_name || 'No client'}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span className={`badge ${getPackageClass(project.package_type)}`}>{PACKAGE_LABELS[project.package_type] || project.package_type}</span>
                      <span className={`badge ${getStatusClass(project.status)}`}>{STATUS_LABELS[project.status] || project.status}</span>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#64748B" }}>Progress</span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#0F172A" }}>{project.progress_percentage || 0}%</span>
                    </div>
                    <div className="progress-premium">
                      <div className="progress-premium-bar" style={{ width: `${project.progress_percentage || 0}%` }} />
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B" }}>
                    <div>{project.package_type} package</div>
                    {project.end_date && <div>Due: {formatDate(project.end_date)}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}