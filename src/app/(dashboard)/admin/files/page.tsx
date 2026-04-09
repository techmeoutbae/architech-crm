import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Folder, Image, MoreHorizontal, Package, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { FILE_CATEGORY_LABELS } from "@/lib/constants"
import { getDashboardUser } from "@/lib/dashboard-user"
import { createClient } from "@/lib/supabase/server"
import { CompactStatCard } from "@/components/dashboard/compact-stat-card"
import { EmptyStateCard } from "@/components/dashboard/empty-state-card"
import type { BadgeProps } from "@/components/ui/badge"

type BadgeVariant = NonNullable<BadgeProps["variant"]>

interface FileRecord {
  id: string
  name: string
  category: string
  file_size: number | null
  created_at: string
  client: { id: string; business_name: string } | null
  project: { id: string; name: string } | null
  uploader: { email: string; full_name: string | null } | null
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  contracts: FileText,
  branding: Image,
  copy: FileText,
  assets: Folder,
  invoices: FileText,
  deliverables: Package,
}

const CATEGORY_VARIANTS: Record<string, BadgeVariant> = {
  contracts: 'blue',
  branding: 'purple',
  copy: 'orange',
  assets: 'cyan',
  invoices: 'warning',
  deliverables: 'success',
}

async function getFiles(): Promise<FileRecord[]> {
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
  return (data as FileRecord[]) || []
}

export default async function FilesPage() {
  const userData = await getDashboardUser()

  if (!userData) {
    redirect("/login")
  }
  
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
      
      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 pb-10 sm:p-6 xl:p-8">
          <div className="flex flex-col gap-4 rounded-[26px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(248,251,255,0.7)_100%)] p-5 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[44rem]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Secure documents
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.3rem]">
                Keep client assets, contracts, and deliverables organized with confidence.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Review file volume across categories and maintain a cleaner record of what has been shared, uploaded, and archived.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[18px] border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.18)]">
              <ShieldCheck className="h-4 w-4 text-[#1b4d7e]" />
              Secure storage overview
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Object.entries(FILE_CATEGORY_LABELS).map(([category, label]) => {
            return (
              <CompactStatCard
                key={category}
                label={label}
                value={categoryCounts[category] || 0}
                detail="Stored files"
                tone={
                  category === "contracts"
                    ? "blue"
                    : category === "branding"
                      ? "violet"
                      : category === "copy"
                        ? "amber"
                        : category === "assets"
                          ? "cyan"
                          : category === "invoices"
                            ? "slate"
                            : "emerald"
                }
              />
            )
          })}
          </div>

          {files.length === 0 ? (
            <EmptyStateCard
              icon={FileText}
              title="No files uploaded yet"
              description="Upload your first contract, deliverable, or supporting asset to build out the document workspace."
            />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-200/75 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Document library
                    </p>
                    <CardTitle className="mt-2">All files</CardTitle>
                  </div>
                  <Badge variant="secondary">{files.length} files</Badge>
                </div>
                <CardDescription>Track the category, uploader, client, and project context for every file in the CRM.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Uploaded by</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[70px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const Icon = CATEGORY_ICONS[file.category] || FileText
                              return (
                                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-slate-200/80 bg-slate-50/85 text-slate-500">
                                  <Icon className="h-4 w-4" />
                                </div>
                              )
                            })()}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">{file.name}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">File record</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={CATEGORY_VARIANTS[file.category] || "secondary"}>
                            {FILE_CATEGORY_LABELS[file.category] || file.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">{file.project?.name || "-"}</TableCell>
                        <TableCell className="text-slate-500">{file.client?.business_name || "-"}</TableCell>
                        <TableCell className="text-slate-500">
                          {file.uploader?.full_name || file.uploader?.email || "-"}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : "-"}
                        </TableCell>
                        <TableCell className="text-slate-500">{formatDate(file.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
