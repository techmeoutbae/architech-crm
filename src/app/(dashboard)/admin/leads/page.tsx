import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants"

async function getLeads(search?: string) {
  const supabase = await createClient()
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
  
  if (search) {
    query = query.or(`business_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  
  const { data } = await query
  return data || []
}

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile || {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || "Admin",
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "admin",
  }
}

function getStatusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    new: 'blue',
    contacted: 'warning',
    discovery: 'purple',
    proposal: 'orange',
    won: 'success',
    lost: 'destructive',
  }
  return map[status] || 'secondary'
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const leads = await getLeads(searchParams.search)

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Header 
        title="Leads" 
        subtitle="Manage your sales pipeline and leads"
        user={userData}
        showSearch
        showAddButton
        addButtonLabel="Add Lead"
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(LEAD_STATUS_LABELS).map(([status, label]) => (
            <Link key={status} href={`/admin/leads?search=&status=${status}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${LEAD_STATUS_COLORS[status]?.replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-')}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>{leads.length} total leads</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No leads found</p>
                      <p className="text-sm">Add your first lead to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Link href={`/admin/leads/${lead.id}`} className="hover:text-[#3B82F6]">
                          <p className="font-medium text-gray-900">{lead.business_name}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.contact_name}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{lead.service_interest || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{lead.source || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(lead.estimated_value)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(lead.status) as any}>
                          {LEAD_STATUS_LABELS[lead.status] || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{formatDate(lead.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/leads/${lead.id}`}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
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