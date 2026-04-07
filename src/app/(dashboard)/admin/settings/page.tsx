import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, Bell, CreditCard, Palette, Mail } from "lucide-react"

async function getUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  return profile || { email: user.email || "", full_name: user.user_metadata?.full_name || "Admin", avatar_url: user.user_metadata?.avatar_url || null, role: "admin" }
}

async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('key, value')
  const settings: Record<string, any> = {}
  data?.forEach(s => { settings[s.key] = s.value })
  return settings
}

export default async function SettingsPage() {
  const userData = await getUserData()
  if (!userData) redirect("/login")
  
  const settings = await getSettings()

  return (
    <>
      <Header title="Settings" subtitle="Manage your agency and account" user={userData} />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'agency', label: 'Agency', icon: Building2 },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'billing', label: 'Billing', icon: CreditCard },
                { id: 'appearance', label: 'Appearance', icon: Palette },
              ].map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agency Information</CardTitle>
                <CardDescription>Manage your agency details displayed to clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agency Name</Label>
                    <Input defaultValue="Architech Designs LLC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input defaultValue="https://architechdesigns.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue="hello@architechdesigns.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea defaultValue="123 Design Street, Suite 100&#10;San Francisco, CA 94102" rows={3} />
                </div>
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Types</CardTitle>
                <CardDescription>Customize the services you offer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Basic Website', price: '$2,500', description: '5-page website with basic features' },
                    { name: 'Premium Website', price: '$5,000', description: '10-page website with advanced features' },
                    { name: 'Growth Package', price: '$8,000', description: 'Full digital marketing package' },
                    { name: 'Custom Package', price: 'Custom', description: 'Tailored to client needs' },
                  ].map((pkg, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{pkg.name}</p>
                        <p className="text-sm text-gray-500">{pkg.description}</p>
                      </div>
                      <Badge variant="outline">{pkg.price}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Status Pipeline</CardTitle>
                <CardDescription>Customize your lead workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['New', 'Contacted', 'Discovery Scheduled', 'Proposal Sent', 'Closed Won', 'Closed Lost'].map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="font-medium text-gray-700">{status}</span>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Settings</CardTitle>
                <CardDescription>Configure how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'New lead notifications', description: 'Get notified when new leads submit the form' },
                  { label: 'Invoice payments', description: 'Get notified when invoices are paid' },
                  { label: 'Project updates', description: 'Get notified on project milestone completions' },
                  { label: 'Client messages', description: 'Get notified when clients send messages' },
                ].map((notif, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{notif.label}</p>
                      <p className="text-sm text-gray-500">{notif.description}</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Settings</CardTitle>
                <CardDescription>Manage your personal account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={userData.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={userData.email} disabled />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}