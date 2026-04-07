import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatDate, formatCurrency } from "@/lib/utils"
import { PROJECT_STATUS_LABELS } from "@/lib/constants"
import { FolderKanban, FileText, CreditCard, MessageSquare, Clock, CheckCircle, ArrowRight } from "lucide-react"

const STATUS_VARIANTS: Record<string, string> = {
  onboarding: 'blue', planning: 'indigo', design: 'purple', development: 'cyan', revisions: 'warning', launch: 'orange', completed: 'success'
}

async function getClientData(userId: string) {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('*, user:users(*)')
    .eq('user_id', userId)
    .single()
  
  return client
}

async function getProjects(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return data || []
}

async function getInvoices(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getMessages(clientId: string) {
  const supabase = await createClient()
  const projects = await getProjects(clientId)
  if (!projects.length) return []
  
  const { data } = await supabase
    .from('messages')
    .select('*, user:users(email, full_name)')
    .in('project_id', projects.map(p => p.id))
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")
  
  const client = await getClientData(user.id)
  
  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-500 mb-4">No client account linked to your profile yet.</p>
            <p className="text-sm text-gray-400">Please contact Architech Designs to get set up.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projects = await getProjects(client.id)
  const invoices = await getInvoices(client.id)
  const messages = await getMessages(client.id)
  
  const activeProjects = projects.filter(p => p.status !== 'completed')
  const pendingInvoices = invoices.filter(i => ['sent', 'overdue'].includes(i.status))

  return (
    <>
      <Header 
        title="Welcome" 
        subtitle={`${client.business_name}`}
        user={{ email: user.email || '', full_name: client.contact_name, avatar_url: null, role: 'client' }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          <p className="text-gray-500">Track progress and stay updated</p>
        </div>

        {activeProjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No active projects</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeProjects.map((project) => (
              <Link key={project.id} href={`/portal/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-[#3B82F6] h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={STATUS_VARIANTS[project.status] as any || 'secondary'}>
                        {PROJECT_STATUS_LABELS[project.status] || project.status}
                      </Badge>
                    </div>
                    <CardDescription>{project.package_type} Package</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Progress</span>
                          <span className="text-sm font-medium text-gray-900">{project.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={project.progress_percentage || 0} className="h-2" />
                      </div>
                      {project.end_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Due: {formatDate(project.end_date)}</span>
                        </div>
                      )}
                      <Button variant="outline" className="w-full mt-2">
                        View Details <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Invoices</CardTitle>
                <CardDescription>Billing and payments</CardDescription>
              </div>
              <Link href="/portal/invoices">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No invoices</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.slice(0, 4).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{invoice.invoice_number}</p>
                        <p className="text-xs text-gray-500">{formatDate(invoice.due_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</p>
                        <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'warning'} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Updates</CardTitle>
                <CardDescription>Project messages and updates</CardDescription>
              </div>
              <Link href="/portal/messages">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 4).map((msg) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-xs">
                          {msg.user?.full_name?.charAt(0) || msg.user?.email?.charAt(0)}
                        </div>
                        <span className="font-medium text-sm text-gray-900">{msg.user?.full_name || msg.user?.email || 'Team'}</span>
                        <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {pendingInvoices.length > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Action Required</h3>
                  <p className="text-sm text-gray-600">You have {pendingInvoices.length} pending invoice(s) that require attention.</p>
                </div>
                <Link href="/portal/invoices">
                  <Button>View Invoices</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}