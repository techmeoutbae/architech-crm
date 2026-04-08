"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"

interface AddLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "discovery", label: "Discovery" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

const SERVICE_OPTIONS = [
  { value: "website", label: "Website Design" },
  { value: "branding", label: "Branding" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Digital Marketing" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "other", label: "Other" },
]

const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social Media" },
  { value: "google", label: "Google" },
  { value: "advertising", label: "Advertising" },
  { value: "other", label: "Other" },
]

export function AddLeadModal({ open, onOpenChange, onSuccess }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    service_interest: "",
    source: "",
    estimated_value: "",
    status: "new",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("leads").insert({
      business_name: formData.business_name,
      contact_name: formData.contact_name,
      email: formData.email,
      phone: formData.phone || null,
      service_interest: formData.service_interest || null,
      source: formData.source || null,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
      status: formData.status,
    })

    setLoading(false)

    if (error) {
      console.error("Error adding lead:", error)
      alert("Failed to add lead: " + error.message)
      return
    }

    setFormData({
      business_name: "",
      contact_name: "",
      email: "",
      phone: "",
      service_interest: "",
      source: "",
      estimated_value: "",
      status: "new",
    })
    onOpenChange(false)
    if (onSuccess) onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#0F172A]">Add New Lead</DialogTitle>
          <DialogDescription className="text-gray-500">
            Enter the lead details to add them to your pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Business Name *</label>
              <Input
                required
                value={formData.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div className="col-span-2">
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">Service Interest</label>
              <Select value={formData.service_interest} onValueChange={(v) => handleChange("service_interest", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
              <Select value={formData.source} onValueChange={(v) => handleChange("source", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Estimated Value ($)</label>
              <Input
                type="number"
                value={formData.estimated_value}
                onChange={(e) => handleChange("estimated_value", e.target.value)}
                placeholder="5000"
                min="0"
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
              {loading ? "Adding..." : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}