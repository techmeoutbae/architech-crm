import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, formatCurrency } from "@/lib/utils"
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PACKAGE_LABELS } from "@/lib/constants"
import { ArrowLeft, FolderKanban, Calendar, DollarSign, CheckCircle, Circle, Clock, MessageSquare, Send } from "lucide-react"

async function getProject(id: string) {
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, business_name, contact_name, email),
      tasks(*),
      milestones(*),
      messages(*, user:users(email, full_name))
    `)
    .eq('id', id)
    .single()
  return project
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

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const project = await getProject(params.id)
  
  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <Link href="/admin/projects"><Button variant="outline" className="mt-4">Back to Projects</Button></Link>
        </div>
      </div>
    )
  }

  const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0
  const totalTasks = project.tasks?.length || 0

  return (
    <>
      <Header title="Project Details" subtitle={project.name} user={userData} />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/projects">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
          <Badge variant={getStatusVariant(project.status) as any} className="ml-auto">
            {PROJECT_STATUS_LABELS[project.status] || project.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-900">{project.progress_percentage || 0}%</span>
              </div>
              <Progress value={project.progress_percentage || 0} className="h-2" />
              <p className="text-xs text-gray-400 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-semibold text-gray-900">{project.start_date ? formatDate(project.start_date) : 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Package</p>
                  <p className="font-semibold text-gray-900">{PACKAGE_LABELS[project.package_type] || project.package_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tasks</CardTitle>
                <Button variant="outline" size="sm">Add Task</Button>
              </CardHeader>
              <CardContent>
                {project.tasks?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No tasks yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {project.tasks?.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : task.status === 'in_progress' ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          {task.due_date && <p className="text-xs text-gray-500">Due: {formatDate(task.due_date)}</p>}
                        </div>
                        <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'blue' : 'secondary'}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                {project.milestones?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No milestones yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.milestones?.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-100">
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : milestone.status === 'in_progress' ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{milestone.name}</p>
                          {milestone.description && <p className="text-sm text-gray-500">{milestone.description}</p>}
                        </div>
                        {milestone.due_date && (
                          <p className="text-sm text-gray-500">{formatDate(milestone.due_date)}</p>
                        )}
                        <Badge variant={milestone.status === 'completed' ? 'success' : milestone.status === 'in_progress' ? 'blue' : 'secondary'}>
                          {milestone.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Updates</CardTitle>
                <CardDescription>Communication with client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {project.messages?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    project.messages?.map((msg: any) => (
                      <div key={msg.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {msg.user?.full_name?.charAt(0) || msg.user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">{msg.user?.full_name || msg.user?.email || 'User'}</span>
                            <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                            {msg.is_internal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form className="flex gap-2">
                  <Textarea placeholder="Write an update..." rows={2} className="resize-none" />
                  <Button type="submit" size="icon" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Client</p>
                  <Link href={`/admin/clients/${project.client?.id}`} className="font-medium text-gray-900 hover:text-[#3B82F6]">
                    {project.client?.business_name}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <Select defaultValue={project.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Progress</p>
                  <div className="mt-2">
                    <Progress value={project.progress_percentage || 0} className="h-2" />
                    <p className="text-sm text-gray-600 mt-1">{project.progress_percentage || 0}% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Start</span>
                  <span className="font-medium text-gray-900">{project.start_date ? formatDate(project.start_date) : '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">End</span>
                  <span className="font-medium text-gray-900">{project.end_date ? formatDate(project.end_date) : '-'}</span>
                </div>
                {project.end_date && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      {new Date(project.end_date) > new Date() 
                        ? `${Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                        : 'Past due'
                      }
                    </p>
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