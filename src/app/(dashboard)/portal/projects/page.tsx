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
import { FolderKanban, Clock, ArrowRight } from "lucide-react"

const STATUS_VARIANTS: Record<string, string> = {
  onboarding: 'blue', planning: 'indigo', design: 'purple', development: 'cyan', revisions: 'warning', launch: 'orange', completed: 'success'
}

async function getClientData(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('*').eq('user_id', userId).single()
  return data
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

export default async function PortalProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const client = await getClientData(user.id)
  if (!client) redirect("/portal/dashboard")
  
  const projects = await getProjects(client.id)

  return (
    <>
      <Header 
        title="My Projects" 
        subtitle="View and track your projects"
        user={{ email: user.email || '', full_name: client.contact_name, avatar_url: null, role: 'client' }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No projects yet</p>
              <p className="text-sm text-gray-400">Your projects will appear here once assigned</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/portal/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
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
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Start: {project.start_date ? formatDate(project.start_date) : 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>Due: {project.end_date ? formatDate(project.end_date) : 'TBD'}</span>
                        </div>
                      </div>
                      {project.budget && (
                        <div className="text-sm">
                          <span className="text-gray-500">Budget: </span>
                          <span className="font-medium text-gray-900">{formatCurrency(project.budget)}</span>
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
      </div>
    </>
  )
}