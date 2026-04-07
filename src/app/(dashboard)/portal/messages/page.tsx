import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { MessageSquare, Send } from "lucide-react"

async function getClientData(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('*').eq('user_id', userId).single()
  return data
}

async function getProjects(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('id, name').eq('client_id', clientId)
  return data || []
}

async function getMessages(projectIds: string[]) {
  if (!projectIds.length) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('messages')
    .select('*, user:users(email, full_name)')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function PortalMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const client = await getClientData(user.id)
  if (!client) redirect("/portal/dashboard")
  
  const projects = await getProjects(client.id)
  const messages = await getMessages(projects.map(p => p.id))

  return (
    <>
      <Header 
        title="Messages" 
        subtitle="Communicate with our team"
        user={{ email: user.email || '', full_name: client.contact_name, avatar_url: null, role: 'client' }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Project Messages
              </CardTitle>
              <CardDescription>Send and receive updates about your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start a conversation with our team</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.is_internal ? 'bg-gray-50 p-3 rounded-lg' : ''}`}>
                      <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {msg.user?.full_name?.charAt(0) || msg.user?.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{msg.user?.full_name || msg.user?.email || 'Team'}</span>
                          <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                          {msg.is_internal && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Internal</span>}
                        </div>
                        <p className="text-sm text-gray-600">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <form className="flex gap-2">
                <Textarea placeholder="Type your message..." rows={3} className="resize-none flex-1" />
                <Button type="submit" className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}