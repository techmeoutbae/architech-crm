import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { FILE_CATEGORY_LABELS } from "@/lib/constants"
import { FileText, Download, Image, Folder } from "lucide-react"

const CATEGORY_ICONS: Record<string, any> = {
  contracts: FileText, branding: Image, copy: FileText, assets: Folder, invoices: FileText, deliverables: FileText
}

async function getClientData(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('*').eq('user_id', userId).single()
  return data
}

async function getFiles(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select('*, project:projects(name)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function PortalFilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const client = await getClientData(user.id)
  if (!client) redirect("/portal/dashboard")
  
  const files = await getFiles(client.id)

  return (
    <>
      <Header 
        title="Files" 
        subtitle="Access your documents"
        user={{ email: user.email || '', full_name: client.contact_name, avatar_url: null, role: 'client' }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {files.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No files available yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Files</CardTitle>
              <CardDescription>{files.length} files</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    const Icon = CATEGORY_ICONS[file.category] || FileText
                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{FILE_CATEGORY_LABELS[file.category] || file.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{file.project?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">{formatDate(file.created_at)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}