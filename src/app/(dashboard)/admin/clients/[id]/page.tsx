import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatDate, formatCurrency } from "@/lib/utils"
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, DEFAULT_ONBOARDING_ITEMS } from "@/lib/constants"
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  FolderKanban,
  FileText,
  CreditCard,
  User,
  CheckCircle,
  Circle,
  Clock
} from "lucide-react"

async function getClient(id: string) {
  const supabase = await createClient()
  const { data: client } = await supabase
    .from('clients')
    .select(`
      *,
      user:users(email, full_name, avatar_url),
      projects(*),
      onboarding_items(*)
    `)
    .eq('id', id)
    .single()
  return client
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

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  return profile || { email: user.email || "", full_name: user.user_metadata?.full_name || "Admin", avatar_url: user.user_metadata?.avatar_url || null, role: "admin" }
}

function getStatusVariant(status: string) {
  const map: Record<string, string> = {
    onboarding: 'blue', planning: 'indigo', design: 'purple', development: 'cyan', revisions: 'warning', launch: 'orange', completed: 'success'
  }
  return map[status] || 'secondary'
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const client = await getClient(params.id)
  
  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
          <Link href="/admin/clients"><Button variant="outline" className="mt-4">Back to Clients</Button></Link>
        </div>
      </div>
    )
  }

  const totalInvoiced = client.projects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) || 0
  const activeProjects = client.projects?.filter((p: any) => p.status !== 'completed').length || 0

  return (
    <>
      <Header title="Client Details" subtitle={client.business_name} user={userData} />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/clients">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">{client.business_name}</h2>
          <Badge variant={client.status === 'active' ? 'success' : 'secondary'} className="ml-auto">
            {client.status || 'active'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{client.contact_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{client.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{client.address || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Client Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Projects</span>
                <span className="font-medium text-gray-900">{client.projects?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active Projects</span>
                <span className="font-medium text-gray-900">{activeProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Value</span>
                <span className="font-medium text-gray-900">{formatCurrency(totalInvoiced)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Client Since</span>
                <span className="font-medium text-gray-900">{formatDate(client.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Projects</CardTitle>
                <Link href={`/admin/projects/new?client_id=${client.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FolderKanban className="h-4 w-4" /> Add Project
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {client.projects?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.projects?.map((project: any) => (
                      <Link key={project.id} href={`/admin/projects/${project.id}`}>
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-[#3B82F6] hover:bg-blue-50/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <Badge variant={getStatusVariant(project.status) as any}>{PROJECT_STATUS_LABELS[project.status] || project.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{project.package_type || 'Custom'} Package</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={project.progress_percentage || 0} className="flex-1 h-1.5" />
                              <span className="text-xs text-gray-500">{project.progress_percentage || 0}%</span>
                            </div>
                          </div>
                          {project.end_date && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{formatDate(project.end_date)}</p>
                              <p className="text-xs text-gray-500">Due</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Onboarding Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEFAULT_ONBOARDING_ITEMS.slice(0, 5).map((item, index) => {
                    const clientItem = client.onboarding_items?.find((o: any) => o.item_name === item.item_name)
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        {clientItem?.status === 'submitted' || clientItem?.status === 'reviewed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.item_name}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <Badge variant={clientItem?.status === 'submitted' ? 'success' : clientItem?.status === 'reviewed' ? 'blue' : 'secondary'}>
                          {clientItem?.status || 'pending'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/admin/projects/new?client_id=${client.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FolderKanban className="h-4 w-4" /> New Project
                  </Button>
                </Link>
                <Link href={`/admin/invoices/new?client_id=${client.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" /> Create Invoice
                  </Button>
                </Link>
                <Link href={`/admin/files?client_id=${client.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" /> View Files
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Account</CardTitle>
                <CardDescription>Login access</CardDescription>
              </CardHeader>
              <CardContent>
                {client.user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center text-white font-medium">
                      {client.user.full_name?.charAt(0) || client.user.email?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{client.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No account created yet</p>
                    <Button variant="outline" size="sm">Send Invitation</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}