"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Building2, Plus, Users, FolderKanban, Sparkles } from "lucide-react"
import { AddClientModal } from "@/components/clients/AddClientModal"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CompactStatCard } from "@/components/dashboard/compact-stat-card"
import { EmptyStateCard } from "@/components/dashboard/empty-state-card"
import type { BadgeProps } from "@/components/ui/badge"

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  completed: "Completed",
}

type BadgeVariant = NonNullable<BadgeProps["variant"]>

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  active: "success",
  inactive: "secondary",
  completed: "blue",
}

const STATUS_TONES: Record<string, "emerald" | "slate" | "blue"> = {
  active: "emerald",
  inactive: "slate",
  completed: "blue",
}

interface UserData {
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface Client {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  status: string
  created_at: string
  projects?: { id: string; name: string; status: string }[]
}

export default function ClientsClient({ userData }: { userData: UserData }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function fetchClients() {
    const supabase = createClient()
    const { data } = await supabase
      .from('clients')
      .select(`*, projects(id, name, status)`)
      .order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let isActive = true
    const supabase = createClient()

    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select(`*, projects(id, name, status)`)
        .order('created_at', { ascending: false })

      if (!isActive) {
        return
      }

      setClients(data || [])
      setLoading(false)
    }

    void loadClients()

    return () => {
      isActive = false
    }
  }, [])

  const statusCounts = clients.reduce<Record<string, number>>((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-[18px] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm font-medium text-slate-500 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.18)]">
          Loading clients...
        </div>
      </div>
    )
  }

  return (
    <>
      <Header
        title="Clients"
        subtitle="Review accounts, project load, and lifecycle status."
        user={userData}
        showSearch
        showQuickAdd
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 pb-10 sm:p-5 xl:p-7">
          <div className="flex flex-col gap-4 rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(248,251,255,0.7)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[44rem]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Accounts
              </p>
              <h2 className="mt-2.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[1.95rem]">
                Keep client accounts easy to scan.
              </h2>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Review account status, current project load, and relationship history in one place.
              </p>
            </div>

            <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add client
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <CompactStatCard
                key={status}
                label={label}
                value={statusCounts[status] || 0}
                detail={status === "active" ? "Currently engaged accounts" : "Account lifecycle"}
                tone={STATUS_TONES[status]}
              />
            ))}
          </div>

          {clients.length === 0 ? (
            <EmptyStateCard
              icon={Building2}
              title="No client accounts yet"
              description="Create your first client to organize relationships, project workspaces, and delivery history."
              hint="Open the first account"
              action={
                <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
                  Add client
                </Button>
              }
            />
          ) : (
            <Card>
              <CardHeader className="border-b border-slate-200/75 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Account directory
                    </p>
                    <CardTitle className="mt-2">Client portfolio</CardTitle>
                  </div>
                  <Badge variant="secondary">{clients.length} accounts</Badge>
                </div>
                <CardDescription>Open any account to review projects, onboarding assets, and communication context.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {clients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/admin/clients/${client.id}`}
                      className="group rounded-[20px] border border-slate-200/80 bg-white/78 p-5 no-underline transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_24px_55px_-34px_rgba(15,23,42,0.24)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#0f355c_0%,#2f6fdf_100%)] text-base font-semibold text-white shadow-[0_18px_38px_-24px_rgba(15,23,42,0.32)]">
                          {client.business_name?.charAt(0) || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold tracking-[-0.02em] text-slate-950">
                                {client.business_name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">{client.contact_name}</p>
                            </div>
                            <Badge variant={STATUS_VARIANTS[client.status] || "secondary"}>
                              {STATUS_LABELS[client.status] || client.status}
                            </Badge>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[16px] border border-slate-200/70 bg-slate-50/75 px-4 py-3">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                <FolderKanban className="h-3.5 w-3.5" />
                                Active work
                              </div>
                              <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                                {client.projects?.length || 0}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">Project workspaces</p>
                            </div>

                            <div className="rounded-[16px] border border-slate-200/70 bg-slate-50/75 px-4 py-3">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                <Users className="h-3.5 w-3.5" />
                                Relationship
                              </div>
                              <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                                {formatDate(client.created_at)}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">First recorded</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1b4d7e]">
                            <Sparkles className="h-4 w-4" />
                            Open account view
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddClientModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchClients} />
    </>
  )
}
