"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "completed", label: "Completed" },
]

export function AddClientModal({ open, onOpenChange, onSuccess }: AddClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    status: "active",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("clients").insert({
      business_name: formData.business_name,
      contact_name: formData.contact_name,
      email: formData.email,
      phone: formData.phone || null,
      status: formData.status,
    })

    setLoading(false)

    if (error) {
      console.error("Error adding client:", error)
      alert("Failed to add client: " + error.message)
      return
    }

    setFormData({
      business_name: "",
      contact_name: "",
      email: "",
      phone: "",
      status: "active",
    })
    onOpenChange(false)
    if (onSuccess) onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#0F172A]">Add New Client</DialogTitle>
          <DialogDescription className="text-gray-500">
            Enter the client details to add them to your CRM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Business Name *</label>
              <Input
                required
                value={formData.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Name *</label>
              <Input
                required
                value={formData.contact_name}
                onChange={(e) => handleChange("contact_name", e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {loading ? "Adding..." : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}