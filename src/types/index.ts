export type LeadStatus = 'new' | 'contacted' | 'discovery' | 'proposal' | 'won' | 'lost'
export type ProjectStatus = 'onboarding' | 'planning' | 'design' | 'development' | 'revisions' | 'launch' | 'completed'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue'
export type UserRole = 'admin' | 'team' | 'client'
export type PackageType = 'basic' | 'premium' | 'growth' | 'custom'
export type FileCategory = 'contracts' | 'branding' | 'copy' | 'assets' | 'invoices' | 'deliverables'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type OnboardingItemStatus = 'pending' | 'submitted' | 'reviewed'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Profile extends User {
  client_id?: string
}

export interface Lead {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  service_interest: string | null
  source: string | null
  status: LeadStatus
  notes: string | null
  estimated_value: number | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  address: string | null
  lead_id: string | null
  status: 'active' | 'inactive' | 'completed'
  created_at: string
  updated_at: string
  user?: User
  projects?: Project[]
}

export interface Project {
  id: string
  client_id: string
  name: string
  package_type: PackageType
  status: ProjectStatus
  progress_percentage: number
  start_date: string | null
  end_date: string | null
  budget: number | null
  created_at: string
  updated_at: string
  client?: Client
  tasks?: Task[]
  milestones?: Milestone[]
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  assigned_to: string | null
  created_at: string
  assigned_user?: User
}

export interface Milestone {
  id: string
  project_id: string
  name: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
}

export interface File {
  id: string
  project_id: string | null
  client_id: string | null
  category: FileCategory
  name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  created_at: string
  uploader?: User
}

export interface Invoice {
  id: string
  client_id: string
  project_id: string | null
  invoice_number: string
  amount: number
  status: InvoiceStatus
  due_date: string | null
  paid_at: string | null
  notes: string | null
  stripe_payment_id: string | null
  created_at: string
  updated_at: string
  client?: Client
}

export interface Message {
  id: string
  project_id: string
  user_id: string
  content: string
  is_internal: boolean
  created_at: string
  user?: User
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  user?: User
}

export interface OnboardingItem {
  id: string
  client_id: string
  item_name: string
  description: string | null
  status: OnboardingItemStatus
  submitted_at: string | null
  notes: string | null
}

export interface DashboardStats {
  totalLeads: number
  activeLeads: number
  totalClients: number
  activeClients: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  unpaidInvoices: number
  overdueInvoices: number
}

export interface LeadWithStats extends Lead {
  project_count?: number
}

export interface ClientWithProjects extends Client {
  projects: Project[]
  onboarding_items?: OnboardingItem[]
}

export interface ProjectWithDetails extends Project {
  client: Client
  tasks: Task[]
  milestones: Milestone[]
  messages: Message[]
}