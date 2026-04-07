import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  Users, 
  Building2, 
  FolderKanban, 
  DollarSign, 
  TrendingUp, 
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle
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

  return {
    totalLeads: leadsResult.count || 0,
    activeLeads,
    totalClients: clientsResult.count || 0,
    activeClients,
    activeProjects,
    completedProjects,
    totalRevenue,
    unpaidInvoices,
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

async function getRecentInvoices() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(business_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

function getLeadStatusVariant(status: string) {
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

function getProjectStatusVariant(status: string) {
  const map: Record<string, string> = {
    onboarding: 'blue',
    planning: 'indigo',
    design: 'purple',
    development: 'cyan',
    revisions: 'warning',
    launch: 'orange',
    completed: 'success',
  }
  return map[status] || 'secondary'
}

function getInvoiceStatusVariant(status: string) {
  const map: Record<string, string> = {
    draft: 'secondary',
    sent: 'blue',
    paid: 'success',
    partial: 'warning',
    overdue: 'destructive',
  }
  return map[status] || 'secondary'
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const userData = profile || {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || "Admin",
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "admin",
  }

  const stats = await getStats()
  const recentLeads = await getRecentLeads()
  const activeProjects = await getActiveProjects()
  const recentInvoices = await getRecentInvoices()

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle={`Welcome back, ${userData.full_name || 'Admin'}`}
        user={userData}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#3B82F6]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Leads</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeLeads}</p>
                  <p className="text-xs text-gray-400 mt-1">of {stats.totalLeads} total leads</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#3B82F6]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#10B981]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeClients}</p>
                  <p className="text-xs text-gray-400 mt-1">of {stats.totalClients} total</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#8B5CF6]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeProjects}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.completedProjects} completed</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-[#8B5CF6]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F59E0B]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.unpaidInvoices} unpaid invoices</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#F59E0B]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Active Projects</CardTitle>
                <CardDescription>Projects currently in progress</CardDescription>
              </div>
              <Link href="/admin/projects">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No active projects</p>
                  </div>
                ) : (
                  activeProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">{project.name}</p>
                          <Badge variant={getProjectStatusVariant(project.status) as any}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {project.client?.business_name || 'No client'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={project.progress_percentage || 0} className="flex-1 h-1.5" />
                          <span className="text-xs text-gray-500">{project.progress_percentage || 0}%</span>
                        </div>
                      </div>
                      {project.end_date && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(project.end_date)}
                          </p>
                          <p className="text-xs text-gray-500">Due</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Leads</CardTitle>
                <CardDescription>Latest lead submissions</CardDescription>
              </div>
              <Link href="/admin/leads">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No leads yet</p>
                  </div>
                ) : (
                  recentLeads.map((lead: any) => (
                    <Link 
                      key={lead.id} 
                      href={`/admin/leads/${lead.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        {lead.business_name?.charAt(0) || 'L'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{lead.business_name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                      </div>
                      <Badge variant={getLeadStatusVariant(lead.status) as any} className="text-xs">
                        {lead.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Invoices</CardTitle>
                <CardDescription>Latest invoice activity</CardDescription>
              </div>
              <Link href="/admin/invoices">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInvoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No invoices yet</p>
                  </div>
                ) : (
                  recentInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{invoice.invoice_number}</p>
                        <p className="text-xs text-gray-500 truncate">{invoice.client?.business_name || 'No client'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">{formatCurrency(invoice.amount)}</p>
                        <Badge variant={getInvoiceStatusVariant(invoice.status) as any} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/leads/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <Users className="h-5 w-5 text-[#3B82F6]" />
                    <span className="text-sm">Add Lead</span>
                  </Button>
                </Link>
                <Link href="/admin/clients/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#10B981]" />
                    <span className="text-sm">Add Client</span>
                  </Button>
                </Link>
                <Link href="/admin/projects/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-[#8B5CF6]" />
                    <span className="text-sm">New Project</span>
                  </Button>
                </Link>
                <Link href="/admin/invoices/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#F59E0B]" />
                    <span className="text-sm">Create Invoice</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}