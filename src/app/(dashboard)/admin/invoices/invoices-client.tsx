"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, DollarSign, CreditCard, Download, Plus, FileText } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { INVOICE_STATUS_LABELS } from "@/lib/constants"
import { AddInvoiceModal } from "@/components/invoices/AddInvoiceModal"
import { MetricCard } from "@/components/dashboard/metric-card"
import { EmptyStateCard } from "@/components/dashboard/empty-state-card"
import type { BadgeProps } from "@/components/ui/badge"

const STATUS_VARIANTS: Record<string, string> = {
  draft: 'secondary', sent: 'blue', paid: 'success', partial: 'warning', overdue: 'destructive'
}

type BadgeVariant = NonNullable<BadgeProps["variant"]>

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
  full_name: string | null
  avatar_url: string | null
  role: string
}

export default function InvoicesClient({ userData }: { userData: UserData }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function fetchInvoices() {
    const supabase = createClient()
    const { data } = await supabase
      .from('invoices')
      .select(`*, client:clients(id, business_name, email), project:projects(id, name)`)
      .order('created_at', { ascending: false })
    setInvoices(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let isActive = true
    const supabase = createClient()

    async function loadInvoices() {
      const { data } = await supabase
        .from('invoices')
        .select(`*, client:clients(id, business_name, email), project:projects(id, name)`)
        .order('created_at', { ascending: false })

      if (!isActive) {
        return
      }

      setInvoices(data || [])
      setLoading(false)
    }

    void loadInvoices()

    return () => {
      isActive = false
    }
  }, [])

  const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0)
  const unpaidAmount = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + (i.amount || 0), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-[18px] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm font-medium text-slate-500 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.18)]">
          Loading invoices...
        </div>
      </div>
    )
  }

  return (
    <>
      <Header
        title="Invoices"
        subtitle="Manage billing, payment health, and collection risk with a more polished finance workspace."
        user={userData}
        showSearch
        showQuickAdd
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 pb-10 sm:p-6 xl:p-8">
          <div className="flex flex-col gap-4 rounded-[26px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(248,251,255,0.7)_100%)] p-5 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[44rem]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Billing workspace
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.3rem]">
                Keep invoicing calm, visible, and operationally sharp.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Review payment status, invoice exposure, and collection pressure without digging through separate views.
              </p>
            </div>

            <Button type="button" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Create invoice
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              eyebrow="Revenue"
              title="Total invoiced"
              value={formatCurrency(totalAmount)}
              detail="Gross value of all invoices on record"
              icon={DollarSign}
              tone="blue"
            />
            <MetricCard
              eyebrow="Settled"
              title="Paid"
              value={formatCurrency(paidAmount)}
              detail="Collected revenue successfully closed"
              icon={CreditCard}
              tone="emerald"
            />
            <MetricCard
              eyebrow="Outstanding"
              title="Unpaid"
              value={formatCurrency(unpaidAmount)}
              detail="Open billing still waiting for collection"
              icon={FileText}
              tone="amber"
            />
            <MetricCard
              eyebrow="Risk"
              title="Overdue"
              value={String(overdueCount)}
              detail="Invoices needing direct follow-up"
              icon={MoreHorizontal}
              tone={overdueCount > 0 ? "rose" : "slate"}
            />
          </div>

          {invoices.length === 0 ? (
            <EmptyStateCard
              icon={DollarSign}
              title="No invoices yet"
              description="Create your first invoice to start tracking revenue, payment status, and billing follow-up."
            />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-200/75 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Invoice ledger
                    </p>
                    <CardTitle className="mt-2">All invoices</CardTitle>
                  </div>
                  <Badge variant="secondary">{invoices.length} invoices</Badge>
                </div>
                <CardDescription>Monitor every invoice across client, project, status, due date, and payment position.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link href={`/admin/invoices/${invoice.id}`} className="flex items-center gap-3 no-underline">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-sky-200/80 bg-sky-50/90 text-sm font-semibold text-sky-700">
                              #{invoice.invoice_number.slice(-2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-950">{invoice.invoice_number}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                                Invoice record
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-slate-500">{invoice.client?.business_name || "-"}</TableCell>
                        <TableCell className="text-slate-500">{invoice.project?.name || "-"}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-950">{formatCurrency(invoice.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(STATUS_VARIANTS[invoice.status] as BadgeVariant) || "secondary"}>
                            {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {invoice.due_date ? formatDate(invoice.due_date) : "-"}
                        </TableCell>
                        <TableCell className="text-slate-500">{formatDate(invoice.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddInvoiceModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchInvoices} />
    </>
  )
}
