import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Building2, Plus, Users, FolderKanban } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  completed: 'Completed',
}

function getStatusClass(status: string) {
  return status === 'active' ? 'badge-active' : status === 'completed' ? 'badge-completed' : 'badge-inactive'
}

async function getClients() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select(`
      *,
      projects(id, name, status)
    `)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const clients = await getClients()

  return (
    <>
      {/* Page Header */}
      <header style={{ background: "white", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#0F172A" }}>Clients</h1>
            <p style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>Manage your client relationships</p>
          </div>
          <button style={{ padding: "10px 20px", background: "#0A2540", borderRadius: "8px", fontWeight: "500", fontSize: "14px", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus style={{ width: "16px", height: "16px" }} /> Add Client
          </button>
        </div>
      </header>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        
        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="card-premium" style={{ padding: "48px", textAlign: "center" }}>
            <div className="empty-state-icon">
              <Building2 style={{ width: "28px", height: "28px" }} />
            </div>
            <div className="empty-state-title">No clients yet</div>
            <div className="empty-state-description">Add your first client to get started</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {clients.map((client: any) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`} style={{ textDecoration: "none" }}>
                <div className="card-premium" style={{ padding: "20px", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #10B981, #34D399)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "18px" }}>
                      {client.business_name?.charAt(0) || 'C'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#0F172A", fontSize: "16px" }}>{client.business_name}</div>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>{client.contact_name}</div>
                    </div>
                    <span className={`badge ${getStatusClass(client.status)}`}>{STATUS_LABELS[client.status] || client.status}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#64748B" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FolderKanban style={{ width: "14px", height: "14px" }} />
                      {client.projects?.length || 0} projects
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users style={{ width: "14px", height: "14px" }} />
                      Since {formatDate(client.created_at)}
                    </div>
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