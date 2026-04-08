"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, DollarSign, CreditCard, Download, Plus } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { INVOICE_STATUS_LABELS } from "@/lib/constants"
import { AddInvoiceModal } from "@/components/invoices/AddInvoiceModal"

const STATUS_VARIANTS: Record<string, string> = {
  draft: 'secondary', sent: 'blue', paid: 'success', partial: 'warning', overdue: 'destructive'
}

interface Invoice {
  id: string
  invoice_number: string
  client_id: string | null
  project_id: string | null
  amount: number
  status: string
  due_date: string | null
  created_at: string
  client?: { id: string; business_name: string; email: string }
  project?: { id: string; name: string }
}

interface UserData {
  email: string
  full_name: string
  avatar_url: string | null
  role: string
}

export default function InvoicesClient({ userData }: { userData: UserData }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('invoices')
      .select(`*, client:clients(id, business_name, email), project:projects(id, name)`)
      .order('created_at', { ascending: false })
    setInvoices(data || [])
    setLoading(false)
  }

  const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0)
  const unpaidAmount = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + (i.amount || 0), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#64748B" }}>Loading invoices...</div>
      </div>
    )
  }

  return (
    <>
      <header style={{ background: "white", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#0F172A" }}>Invoices</h1>
            <p style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>Manage billing and payments</p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            style={{ padding: "10px 20px", background: "#0A2540", borderRadius: "8px", fontWeight: "500", fontSize: "14px", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Plus style={{ width: "16px", height: "16px" }} /> Create Invoice
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div className="card-premium" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748B" }}>Total Invoiced</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>{formatCurrency(totalAmount)}</p>
              </div>
              <div style={{ width: "48px", height: "48px", background: "#EFF6FF", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign style={{ width: "24px", height: "24px", color: "#3B82F6" }} />
              </div>
            </div>
          </div>
          <div className="card-premium" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748B" }}>Paid</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>{formatCurrency(paidAmount)}</p>
              </div>
              <div style={{ width: "48px", height: "48px", background: "#ECFDF5", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard style={{ width: "24px", height: "24px", color: "#10B981" }} />
              </div>
            </div>
          </div>
          <div className="card-premium" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748B" }}>Unpaid</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>{formatCurrency(unpaidAmount)}</p>
              </div>
              <div style={{ width: "48px", height: "48px", background: "#FFFBEB", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign style={{ width: "24px", height: "24px", color: "#F59E0B" }} />
              </div>
            </div>
          </div>
          <div className="card-premium" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748B" }}>Overdue</p>
                <p style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>{overdueCount}</p>
              </div>
              <div style={{ width: "48px", height: "48px", background: "#FEF2F2", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard style={{ width: "24px", height: "24px", color: "#EF4444" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div style={{ padding: "20px", borderBottom: "1px solid #E2E8F0" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>All Invoices</h2>
            <p style={{ fontSize: "13px", color: "#64748B" }}>{invoices.length} total invoices</p>
          </div>
          <table className="table-premium">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <DollarSign style={{ width: "28px", height: "28px" }} />
                      </div>
                      <div className="empty-state-title">No invoices yet</div>
                      <div className="empty-state-description">Create your first invoice to get started</div>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <Link href={`/admin/invoices/${invoice.id}`} style={{ color: "#3B82F6", textDecoration: "none", fontWeight: "500" }}>
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td style={{ color: "#64748B" }}>{invoice.client?.business_name || '-'}</td>
                    <td style={{ color: "#64748B" }}>{invoice.project?.name || '-'}</td>
                    <td style={{ fontWeight: "500", color: "#0F172A" }}>{formatCurrency(invoice.amount)}</td>
                    <td>
                      <span className={`badge badge-${invoice.status}`}>{INVOICE_STATUS_LABELS[invoice.status] || invoice.status}</span>
                    </td>
                    <td style={{ color: "#64748B", fontSize: "13px" }}>{invoice.due_date ? formatDate(invoice.due_date) : '-'}</td>
                    <td style={{ color: "#64748B", fontSize: "13px" }}>{formatDate(invoice.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                          <Download style={{ width: "16px", height: "16px" }} />
                        </button>
                        <button style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                          <MoreHorizontal style={{ width: "16px", height: "16px" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddInvoiceModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchInvoices} />
    </>
  )
}