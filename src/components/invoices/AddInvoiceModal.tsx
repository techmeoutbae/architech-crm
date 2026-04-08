"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AddInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
]

interface Client {
  id: string
  business_name: string
}

interface Project {
  id: string
  name: string
}

export function AddInvoiceModal({ open, onOpenChange, onSuccess }: AddInvoiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    invoice_number: "",
    client_id: "",
    project_id: "",
    amount: "",
    status: "draft",
    due_date: "",
    description: "",
  })

  useEffect(() => {
    if (open) {
      fetchData()
      generateInvoiceNumber()
    }
  }, [open])

  const fetchData = async () => {
    const supabase = createClient()
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from('clients').select('id, business_name').order('business_name'),
      supabase.from('projects').select('id, name').order('name'),
    ])
    setClients(clientsRes.data || [])
    setProjects(projectsRes.data || [])
  }

  const generateInvoiceNumber = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1)
    const lastNum = data?.[0]?.invoice_number ? parseInt(data[0].invoice_number.replace('INV-', '')) : 0
    const newNum = lastNum + 1
    setFormData(prev => ({ ...prev, invoice_number: `INV-${String(newNum).padStart(4, '0')}` }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("invoices").insert({
      invoice_number: formData.invoice_number,
      client_id: formData.client_id || null,
      project_id: formData.project_id || null,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      status: formData.status,
      due_date: formData.due_date || null,
      description: formData.description || null,
    })

    setLoading(false)

    if (error) {
      console.error("Error adding invoice:", error)
      alert("Failed to add invoice: " + error.message)
      return
    }

    setFormData({
      invoice_number: "",
      client_id: "",
      project_id: "",
      amount: "",
      status: "draft",
      due_date: "",
      description: "",
    })
    onOpenChange(false)
    if (onSuccess) onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#0F172A]">Create New Invoice</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a new invoice for a client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Invoice Number *</label>
                <Input
                  required
                  value={formData.invoice_number}
                  onChange={(e) => handleChange("invoice_number", e.target.value)}
                  placeholder="INV-0001"
                />
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Client</label>
                <Select value={formData.client_id} onValueChange={(v) => handleChange("client_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.business_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Project</label>
                <Select value={formData.project_id} onValueChange={(v) => handleChange("project_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Amount ($) *</label>
                <Input
                  required
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange("due_date", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Invoice description..."
              />
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
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}