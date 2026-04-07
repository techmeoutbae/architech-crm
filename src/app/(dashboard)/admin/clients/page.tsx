import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { MoreHorizontal, Building2, Mail, Phone, FolderKanban } from "lucide-react"
import { formatDate } from "@/lib/utils"

const STATUS_VARIANTS: Record<string, string> = {
  active: 'success',
  inactive: 'secondary',
  completed: 'blue',
}

async function getClients() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select(`
      *,
      projects(id, name, status, progress_percentage)
    `)
    .order('created_at', { ascending: false })
  return data || []
}

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  return profile || {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || "Admin",
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "admin",
  }
}

export default async function ClientsPage() {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const clients = await getClients()

  return (
    <>
      <Header 
        title="Clients" 
        subtitle="Manage your client relationships"
        user={userData}
        showSearch
        showAddButton
        addButtonLabel="Add Client"
      />
      
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Clients</CardTitle>
                <CardDescription>{clients.length} total clients</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No clients found</p>
                      <p className="text-sm">Add your first client to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client: any) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link href={`/admin/clients/${client.id}`} className="hover:text-[#3B82F6]">
                          <p className="font-medium text-gray-900">{client.business_name}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{client.contact_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{client.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{client.phone || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FolderKanban className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{client.projects?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[client.status] as any || 'secondary'}>
                          {client.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{formatDate(client.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/clients/${client.id}`}>
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