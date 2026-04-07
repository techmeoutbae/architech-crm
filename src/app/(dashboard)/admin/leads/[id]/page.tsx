import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, formatCurrency } from "@/lib/utils"
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants"
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  DollarSign,
  Save,
  UserPlus,
  MessageSquare
} from "lucide-react"

async function getLead(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').eq('id', id).single()
  return data
}

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile || {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || "Admin",
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "admin",
  }
}

function getStatusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    new: 'blue',
    contacted: 'warning',
    discovery: 'purple',
    proposal: 'orange',
    won: 'success',
    lost: 'destructive',
  }
  return map[status] || 'secondary'
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const lead = await getLead(params.id)
  
  if (!lead) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
          <Link href="/admin/leads">
            <Button variant="outline" className="mt-4">Back to Leads</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header 
        title="Lead Details" 
        subtitle={lead.business_name}
        user={userData}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">{lead.business_name}</h2>
          <Badge variant={getStatusBadgeVariant(lead.status) as any} className="ml-auto">
            {LEAD_STATUS_LABELS[lead.status] || lead.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Contact Name</Label>
                    <p className="font-medium text-gray-900">{lead.contact_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Business Name</Label>
                    <p className="font-medium text-gray-900">{lead.business_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium text-gray-900">{lead.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <p className="font-medium text-gray-900">{lead.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Service Interest</Label>
                    <p className="font-medium text-gray-900">{lead.service_interest || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Source</Label>
                    <p className="font-medium text-gray-900">{lead.source || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Estimated Value</Label>
                    <p className="font-medium text-gray-900">{formatCurrency(lead.estimated_value)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date Added</Label>
                    <p className="font-medium text-gray-900">{formatDate(lead.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <Textarea 
                    placeholder="Add notes about this lead..."
                    defaultValue={lead.notes || ''}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Notes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form className="space-y-3">
                  <div>
                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Update Status</Label>
                    <Select defaultValue={lead.status}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Update Status
                  </Button>
                </form>
                
                <div className="pt-3 border-t">
                  <Link href={`/admin/clients/new?lead_id=${lead.id}`} className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <UserPlus className="h-4 w-4" />
                      Convert to Client
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
                <CardDescription>Recent interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No activity yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}