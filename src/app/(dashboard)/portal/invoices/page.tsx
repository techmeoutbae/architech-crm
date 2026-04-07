import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatCurrency } from "@/lib/utils"
import { INVOICE_STATUS_LABELS } from "@/lib/constants"
import { Download, CreditCard } from "lucide-react"

const STATUS_VARIANTS: Record<string, string> = {
  draft: 'secondary', sent: 'blue', paid: 'success', partial: 'warning', overdue: 'destructive'
}

async function getClientData(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('*').eq('user_id', userId).single()
  return data
}

async function getInvoices(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function PortalInvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const client = await getClientData(user.id)
  if (!client) redirect("/portal/dashboard")
  
  const invoices = await getInvoices(client.id)

  return (
    <>
      <Header 
        title="Invoices" 
        subtitle="View your billing history"
        user={{ email: user.email || '', full_name: client.contact_name, avatar_url: null, role: 'client' }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No invoices yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>{invoices.length} total invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
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
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          <Download className="h-4 w-4 mr-1" /> PDF
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}