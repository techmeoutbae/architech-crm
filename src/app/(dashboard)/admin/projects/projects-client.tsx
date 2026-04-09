"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { FolderKanban, Plus, CalendarDays } from "lucide-react"
import { AddProjectModal } from "@/components/projects/AddProjectModal"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CompactStatCard } from "@/components/dashboard/compact-stat-card"
import { EmptyStateCard } from "@/components/dashboard/empty-state-card"
import type { BadgeProps } from "@/components/ui/badge"

const STATUS_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  planning: "Planning",
  design: "Design",
  development: "Development",
  revisions: "Revisions",
  launch: "Launch",
  completed: "Completed",
}

const PACKAGE_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  growth: "Growth",
  custom: "Custom",
}

type BadgeVariant = NonNullable<BadgeProps["variant"]>

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  onboarding: "blue",
  planning: "indigo",
  design: "purple",
  development: "cyan",
  revisions: "warning",
  launch: "orange",
  completed: "success",
}

const STATUS_TONES: Record<string, "blue" | "indigo" | "violet" | "cyan" | "amber" | "slate" | "emerald"> = {
  onboarding: "blue",
  planning: "indigo",
  design: "violet",
  development: "cyan",
  revisions: "amber",
  launch: "slate",
  completed: "emerald",
}

const PACKAGE_VARIANTS: Record<string, BadgeVariant> = {
  basic: "secondary",
  premium: "blue",
  growth: "indigo",
  custom: "purple",
}

interface UserData {
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface Project {
  id: string
  name: string
  client_id: string
  client?: { id: string; business_name: string }
  package_type: string
  status: string
  progress_percentage: number
  end_date: string | null
  created_at: string
}

export default function ProjectsClient({ userData }: { userData: UserData }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  async function fetchProjects() {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select(`*, client:clients(id, business_name)`)
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let isActive = true
    const supabase = createClient()

    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select(`*, client:clients(id, business_name)`)
        .order('created_at', { ascending: false })

      if (!isActive) {
        return
      }

      setProjects(data || [])
      setLoading(false)
    }

    void loadProjects()

    return () => {
      isActive = false
    }
  }, [])

  const statusCounts = projects.reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-[18px] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm font-medium text-slate-500 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.18)]">
          Loading projects...
        </div>
      </div>
    )
  }

  return (
    <>
      <Header
        title="Projects"
        subtitle="Monitor delivery status, scope, and progress."
        user={userData}
        showSearch
        showQuickAdd
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 pb-10 sm:p-5 xl:p-7">
          <div className="flex flex-col gap-4 rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(248,251,255,0.7)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[44rem]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Delivery
              </p>
              <h2 className="mt-2.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[1.95rem]">
                Track delivery status with clarity.
              </h2>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Review package scope, progress, and deadlines across active delivery work.
              </p>
            </div>

            <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <CompactStatCard
              key={status}
              label={label}
              value={statusCounts[status] || 0}
              detail={status === "completed" ? "Delivered work" : "Current delivery stage"}
              tone={STATUS_TONES[status]}
            />
          ))}
          </div>

          {projects.length === 0 ? (
            <EmptyStateCard
              icon={FolderKanban}
              title="No active projects yet"
              description="Create a project to start tracking delivery stages, scope, and launch progress for each client."
              hint="Set up the first delivery workspace"
              action={
                <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
                  Create project
                </Button>
              }
            />
          ) : (
            <Card>
              <CardHeader className="border-b border-slate-200/75 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Delivery board
                    </p>
                    <CardTitle className="mt-2">Project portfolio</CardTitle>
                  </div>
                  <Badge variant="secondary">{projects.length} projects</Badge>
                </div>
                <CardDescription>
                  Open any project for milestones, task tracking, files, and communication history.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="group rounded-[20px] border border-slate-200/80 bg-white/78 p-5 no-underline transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_24px_55px_-34px_rgba(15,23,42,0.24)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold tracking-[-0.03em] text-slate-950">
                            {project.name}
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {project.client?.business_name || "Client not assigned"}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge variant={PACKAGE_VARIANTS[project.package_type] || "secondary"}>
                            {PACKAGE_LABELS[project.package_type] || project.package_type}
                          </Badge>
                          <Badge variant={STATUS_VARIANTS[project.status] || "secondary"}>
                            {STATUS_LABELS[project.status] || project.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[18px] border border-slate-200/70 bg-slate-50/75 p-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                          <span>Progress</span>
                          <span>{project.progress_percentage || 0}%</span>
                        </div>
                        <Progress className="mt-3 h-2.5" value={project.progress_percentage || 0} />
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-slate-400" />
                            {PACKAGE_LABELS[project.package_type] || project.package_type}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {project.end_date ? `Due ${formatDate(project.end_date)}` : "No deadline set"}
                          </span>
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

      <AddProjectModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchProjects} />
    </>
  )
}
