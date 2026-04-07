import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Users, Plus, ArrowRight, Building2 } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  discovery: 'Discovery',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
}

function getStatusClass(status: string) {
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

function formatStatus(status: string) {
  return STATUS_LABELS[status] || status
}

async function getLeads() {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  return data || []
}

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const leads = await getLeads()

  const statusCounts = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {})

  return (
    <>
      {/* Page Header */}
      <header style={{ background: "white", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#0F172A" }}>Leads</h1>
            <p style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>Manage your sales pipeline and prospects</p>
          </div>
          <button style={{ padding: "10px 20px", background: "#0A2540", borderRadius: "8px", fontWeight: "500", fontSize: "14px", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus style={{ width: "16px", height: "16px" }} /> Add Lead
          </button>
        </div>
      </header>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        
        {/* Status Pipeline */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="card-premium" style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>{statusCounts[status] || 0}</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Leads Table */}
        <div className="card-premium" style={{ overflow: "hidden" }}>
          <table className="table-premium">
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Source</th>
                <th>Value</th>
                <th>Status</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Users style={{ width: "28px", height: "28px" }} />
                      </div>
                      <div className="empty-state-title">No leads yet</div>
                      <div className="empty-state-description">Add your first lead to start tracking prospects</div>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #3B82F6, #60A5FA)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>
                          {lead.business_name?.charAt(0) || 'L'}
                        </div>
                        <span style={{ fontWeight: "500", color: "#0F172A" }}>{lead.business_name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "500", color: "#0F172A" }}>{lead.contact_name}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{lead.email}</div>
                    </td>
                    <td style={{ color: "#64748B" }}>{lead.service_interest || '-'}</td>
                    <td style={{ color: "#64748B" }}>{lead.source || '-'}</td>
                    <td>
                      <span style={{ fontWeight: "500", color: "#0F172A" }}>{formatCurrency(lead.estimated_value)}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(lead.status)}`}>{formatStatus(lead.status)}</span>
                    </td>
                    <td style={{ color: "#64748B", fontSize: "13px" }}>{formatDate(lead.created_at)}</td>
                    <td>
                      <Link href={`/admin/leads/${lead.id}`} style={{ color: "#3B82F6", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}