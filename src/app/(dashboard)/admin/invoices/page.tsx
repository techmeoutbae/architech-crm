import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, DollarSign, CreditCard, Download, Send } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { INVOICE_STATUS_LABELS } from "@/lib/constants"

const STATUS_VARIANTS: Record<string, string> = {
  draft: 'secondary', sent: 'blue', paid: 'success', partial: 'warning', overdue: 'destructive'
}

async function getInvoices() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, business_name, email),
      project:projects(id, name)
    `)
    .order('created_at', { ascending: false })
  return data || []
}

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  return profile || { email: user.email || "", full_name: user.user_metadata?.full_name || "Admin", avatar_url: user.user_metadata?.avatar_url || null, role: "admin" }
}

async function getStats() {
  const supabase = await createClient()
  const invoices = await getInvoices()
  
  const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0)
  const unpaidAmount = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + (i.amount || 0), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length
  
  return { totalAmount, paidAmount, unpaidAmount, overdueCount, totalInvoices: invoices.length }
}

export default async function InvoicesPage() {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const invoices = await getInvoices()
  const stats = await getStats()

  return (
    <>
      <Header title="Invoices" subtitle="Manage billing and payments" user={userData} showAddButton addButtonLabel="Create Invoice" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Invoiced</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#3B82F6]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.paidAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unpaid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.unpaidAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#F59E0B]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[#EF4444]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>{stats.totalInvoices} total invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No invoices yet</p>
                      <p className="text-sm">Create your first invoice to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/admin/invoices/${invoice.id}`} className="hover:text-[#3B82F6]">
                          <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{invoice.client?.business_name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{invoice.project?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[invoice.status] as any || 'secondary'}>
                          {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{formatDate(invoice.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}