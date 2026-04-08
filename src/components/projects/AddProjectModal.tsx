"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STATUS_OPTIONS = [
  { value: "onboarding", label: "Onboarding" },
  { value: "planning", label: "Planning" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "revisions", label: "Revisions" },
  { value: "launch", label: "Launch" },
  { value: "completed", label: "Completed" },
]

const PACKAGE_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "premium", label: "Premium" },
  { value: "growth", label: "Growth" },
  { value: "custom", label: "Custom" },
]

interface Client {
  id: string
  business_name: string
}

export function AddProjectModal({ open, onOpenChange, onSuccess }: AddProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    package_type: "premium",
    status: "onboarding",
    progress_percentage: "0",
    end_date: "",
  })

  useEffect(() => {
    if (open) fetchClients()
  }, [open])

  const fetchClients = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('clients').select('id, business_name').order('business_name')
    setClients(data || [])
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("projects").insert({
      name: formData.name,
      client_id: formData.client_id,
      package_type: formData.package_type,
      status: formData.status,
      progress_percentage: parseInt(formData.progress_percentage) || 0,
      end_date: formData.end_date || null,
    })

    setLoading(false)

    if (error) {
      console.error("Error adding project:", error)
      alert("Failed to add project: " + error.message)
      return
    }

    setFormData({
      name: "",
      client_id: "",
      package_type: "premium",
      status: "onboarding",
      progress_percentage: "0",
      end_date: "",
    })
    onOpenChange(false)
    if (onSuccess) onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#0F172A]">Create New Project</DialogTitle>
          <DialogDescription className="text-gray-500">
            Set up a new project for one of your clients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Project Name *</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Website Redesign"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Client *</label>
              <Select value={formData.client_id} onValueChange={(v) => handleChange("client_id", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.business_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Package</label>
                <Select value={formData.package_type} onValueChange={(v) => handleChange("package_type", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Progress (%)</label>
                <Input
                  type="number"
                  value={formData.progress_percentage}
                  onChange={(e) => handleChange("progress_percentage", e.target.value)}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0A2540] hover:bg-[#0F2D50] px-6"
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}