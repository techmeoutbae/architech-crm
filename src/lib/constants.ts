export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  DISCOVERY: 'discovery',
  PROPOSAL: 'proposal',
  WON: 'won',
  LOST: 'lost',
} as const

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  discovery: 'Discovery Scheduled',
  proposal: 'Proposal Sent',
  won: 'Closed Won',
  lost: 'Closed Lost',
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  discovery: 'bg-purple-100 text-purple-700 border-purple-200',
  proposal: 'bg-orange-100 text-orange-700 border-orange-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
}

export const PROJECT_STATUSES = {
  ONBOARDING: 'onboarding',
  PLANNING: 'planning',
  DESIGN: 'design',
  DEVELOPMENT: 'development',
  REVISIONS: 'revisions',
  LAUNCH: 'launch',
  COMPLETED: 'completed',
} as const

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  planning: 'Planning',
  design: 'Design',
  development: 'Development',
  revisions: 'Revisions',
  launch: 'Launch',
  completed: 'Completed',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  onboarding: 'bg-blue-100 text-blue-700',
  planning: 'bg-indigo-100 text-indigo-700',
  design: 'bg-purple-100 text-purple-700',
  development: 'bg-cyan-100 text-cyan-700',
  revisions: 'bg-yellow-100 text-yellow-700',
  launch: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
}

export const PACKAGE_TYPES = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  GROWTH: 'growth',
  CUSTOM: 'custom',
} as const

export const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic Website',
  premium: 'Premium Website',
  growth: 'Growth Package',
  custom: 'Custom Package',
}

export const FILE_CATEGORIES = {
  CONTRACTS: 'contracts',
  BRANDING: 'branding',
  COPY: 'copy',
  ASSETS: 'assets',
  INVOICES: 'invoices',
  DELIVERABLES: 'deliverables',
} as const

export const FILE_CATEGORY_LABELS: Record<string, string> = {
  contracts: 'Contracts',
  branding: 'Branding Assets',
  copy: 'Copy/Content',
  assets: 'Website Assets',
  invoices: 'Invoices',
  deliverables: 'Deliverables',
}

export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
} as const

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  TEAM: 'team',
  CLIENT: 'client',
} as const

export const SERVICE_TYPES = [
  'Basic Website',
  'Premium Website',
  'Growth Package',
  'SEO Services',
  'Social Media',
  'Content Marketing',
  'Custom Project',
  'Maintenance',
]

export const LEAD_SOURCES = [
  'Website Form',
  'Referral',
  'Social Media',
  'Google Ads',
  'Email',
  'Cold Call',
  'Networking',
  'Other',
]

export const DEFAULT_ONBOARDING_ITEMS = [
  { item_name: 'Logo Files', description: 'Company logo in various formats (PNG, SVG, AI)' },
  { item_name: 'Brand Colors', description: 'Brand color codes and guidelines' },
  { item_name: 'Brand Guidelines', description: 'Any existing brand guidelines or style guides' },
  { item_name: 'Website Copy', description: 'Text content for all pages' },
  { item_name: 'Images/Photos', description: 'Product photos, team photos, and imagery' },
  { item_name: 'Domain Access', description: 'Domain registrar login credentials' },
  { item_name: 'Hosting Access', description: 'Current hosting account details' },
  { item_name: 'Social Media Links', description: 'All social media profile URLs' },
  { item_name: 'Competitor Sites', description: 'Links to 3-5 competitor websites' },
  { item_name: 'Target Audience', description: 'Description of ideal customers' },
]

export const THEME = {
  colors: {
    primary: '#0A2540',
    primaryLight: '#1E3A5F',
    secondary: '#3B82F6',
    accent: '#94A3B8',
    silver: '#C0C0C0',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
  },
}