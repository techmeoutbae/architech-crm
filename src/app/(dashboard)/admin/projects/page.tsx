import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, FolderKanban, Calendar, DollarSign } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { PROJECT_STATUS_LABELS } from "@/lib/constants"

const STATUS_VARIANTS: Record<string, string> = {
  onboarding: 'blue', planning: 'indigo', design: 'purple', development: 'cyan', revisions: 'warning', launch: 'orange', completed: 'success'
}

const PACKAGE_VARIANTS: Record<string, string> = {
  basic: 'secondary', premium: 'blue', growth: 'success', custom: 'purple'
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, business_name)
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

export default async function ProjectsPage() {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const projects = await getProjects()

  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Header title="Projects" subtitle="Manage all client projects" user={userData} showSearch showAddButton addButtonLabel="New Project" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {Object.entries(PROJECT_STATUS_LABELS).slice(0, 6).map(([status, label]) => (
            <Link key={status} href={`/admin/projects?status=${status}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Link href="/admin/projects?status=completed">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <p className="text-2xl font-bold text-gray-900">{statusCounts['completed'] || 0}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>All Projects</CardTitle>
            <CardDescription>{projects.length} total projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No projects found</p>
                      <p className="text-sm">Create your first project to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link href={`/admin/projects/${project.id}`} className="hover:text-[#3B82F6]">
                          <p className="font-medium text-gray-900">{project.name}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{project.client?.business_name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PACKAGE_VARIANTS[project.package_type] as any || 'secondary'}>
                          {project.package_type || 'custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[project.status] as any || 'secondary'}>
                          {PROJECT_STATUS_LABELS[project.status] || project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress_percentage || 0} className="w-20 h-1.5" />
                          <span className="text-xs text-gray-500">{project.progress_percentage || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(project.budget)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{project.end_date ? formatDate(project.end_date) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/projects/${project.id}`}>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
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