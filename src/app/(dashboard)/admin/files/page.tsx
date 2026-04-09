import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Upload, Folder, Image, File, Download, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { FILE_CATEGORY_LABELS } from "@/lib/constants"

const CATEGORY_ICONS: Record<string, any> = {
  contracts: FileText,
  branding: Image,
  copy: FileText,
  assets: Folder,
  invoices: FileText,
  deliverables: Package,
}

const CATEGORY_VARIANTS: Record<string, string> = {
  contracts: 'blue',
  branding: 'purple',
  copy: 'orange',
  assets: 'cyan',
  invoices: 'warning',
  deliverables: 'success',
}

async function getFiles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select(`
      *,
      client:clients(id, business_name),
      project:projects(id, name),
      uploader:users(email, full_name)
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

function Package({ className }: { className?: string }) {
  return <Folder className={className} />
}

export default async function FilesPage() {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const files = await getFiles()

  const categoryCounts = files.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Header
        title="Files"
        subtitle="Manage documents and assets"
        user={userData}
        showSearch
        showQuickAdd
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(FILE_CATEGORY_LABELS).map(([category, label]) => {
            const Icon = CATEGORY_ICONS[category] || FileText
            return (
              <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{categoryCounts[category] || 0}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>All Files</CardTitle>
            <CardDescription>{files.length} total files</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No files uploaded yet</p>
                      <p className="text-sm">Upload your first file to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file: any) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = CATEGORY_ICONS[file.category] || FileText
                            return <Icon className="h-4 w-4 text-gray-400" />
                          })()}
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={CATEGORY_VARIANTS[file.category] as any || 'secondary'}>
                          {FILE_CATEGORY_LABELS[file.category] || file.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{file.project?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{file.client?.business_name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{file.uploader?.full_name || file.uploader?.email || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{formatDate(file.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
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
