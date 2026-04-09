"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Users, Plus } from "lucide-react"
import { AddLeadModal } from "@/components/leads/AddLeadModal"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CompactStatCard } from "@/components/dashboard/compact-stat-card"
import { EmptyStateCard } from "@/components/dashboard/empty-state-card"
import type { BadgeProps } from "@/components/ui/badge"

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  discovery: "Discovery",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
}

type BadgeVariant = NonNullable<BadgeProps["variant"]>

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  new: "blue",
  contacted: "warning",
  discovery: "purple",
  proposal: "secondary",
  won: "success",
  lost: "destructive",
}

const STATUS_TONES: Record<string, "blue" | "amber" | "violet" | "slate" | "emerald" | "rose"> = {
  new: "blue",
  contacted: "amber",
  discovery: "violet",
  proposal: "slate",
  won: "emerald",
  lost: "rose",
}

function formatStatus(status: string) {
  return STATUS_LABELS[status] || status
}

interface UserData {
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface Lead {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  service_interest: string | null
  source: string | null
  estimated_value: number
  status: string
  created_at: string
}

export default function LeadsClient({ userData }: { userData: UserData }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function fetchLeads() {
    const supabase = createClient()
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let isActive = true
    const supabase = createClient()

    async function loadLeads() {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })

      if (!isActive) {
        return
      }

      setLeads(data || [])
      setLoading(false)
    }

    void loadLeads()

    return () => {
      isActive = false
    }
  }, [])

  const statusCounts = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-[18px] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm font-medium text-slate-500 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.18)]">
          Loading leads...
        </div>
      </div>
    )
  }

  return (
    <>
      <Header
        title="Leads"
        subtitle="Manage sales momentum, prospect quality, and pipeline movement in a single premium workspace."
        user={userData}
        showSearch
        showQuickAdd
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 pb-10 sm:p-6 xl:p-8">
          <div className="flex flex-col gap-4 rounded-[26px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(248,251,255,0.7)_100%)] p-5 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[44rem]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Pipeline overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.3rem]">
                Keep the next best opportunities visible.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Review lead quality, expected value, acquisition sources, and stage progression without
                losing context.
              </p>
            </div>

            <Button type="button" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add lead
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <CompactStatCard
              key={status}
              label={label}
              value={statusCounts[status] || 0}
              detail={status === "won" ? "Closed opportunities" : "Pipeline stage"}
              tone={STATUS_TONES[status]}
            />
          ))}
        </div>

          {leads.length === 0 ? (
            <EmptyStateCard
              icon={Users}
              title="No leads in the pipeline yet"
              description="Add your first lead to start tracking prospects, service demand, and expected revenue."
            />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-200/75 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Pipeline table
                    </p>
                    <CardTitle className="mt-2">All leads</CardTitle>
                  </div>
                  <Badge variant="secondary">{leads.length} total</Badge>
                </div>
                <CardDescription>Track contact details, service demand, source quality, and deal value.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Estimated value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 no-underline">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-sky-200/80 bg-sky-50/90 text-sm font-semibold text-sky-700">
                              {lead.business_name?.charAt(0) || "L"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">{lead.business_name}</p>
                              <p className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-slate-400">
                                Prospect
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{lead.contact_name}</p>
                            <p className="mt-1 truncate text-sm text-slate-500">{lead.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">{lead.service_interest || "-"}</TableCell>
                        <TableCell className="text-slate-500">{lead.source || "-"}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-950">
                            {formatCurrency(lead.estimated_value)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[lead.status] || "secondary"}>
                            {formatStatus(lead.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">{formatDate(lead.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/leads/${lead.id}`}>View</Link>
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

      <AddLeadModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchLeads} />
    </>
  )
}
