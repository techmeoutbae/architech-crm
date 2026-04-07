# Architech Designs CRM

A production-ready client relationship management system for Architech Designs LLC.

## Quick Start

### 1. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to the **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `supabase/schema.sql` and run it
4. Go to **Settings → API** to find your project URL and keys

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run the Development Server

```bash
cd architech-crm
npm run dev
```

Visit http://localhost:3000 to see the app.

### 4. Seed Test Data

The database schema includes default settings but no sample data. To add test data:

1. Update your `.env.local` with real Supabase credentials
2. Run: `npx tsx scripts/seed.ts`

This creates test accounts:
- **Admin**: admin@architechdesigns.com / password123
- **Team**: team@architechdesigns.com / password123
- **Client**: client@acmecorp.com / password123

## Features

### Admin Dashboard
- Overview stats (leads, clients, projects, revenue)
- Recent leads and projects
- Quick actions

### Lead Management
- Full pipeline tracking (New → Contacted → Discovery → Proposal → Won/Lost)
- Lead details with notes and status updates
- Convert leads to clients

### Client Management
- Client profiles with contact info
- Associated projects, invoices, files
- Onboarding checklist tracking

### Project Management
- Project status tracking (Onboarding → Launch → Completed)
- Task and milestone management
- Progress percentage tracking
- Client communication/messaging

### Client Portal
- Project overview and progress
- Invoice viewing and payment status
- File access
- Message thread with agency

### Additional Features
- File management by category
- Invoice tracking
- Agency settings customization

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + Radix UI components
- **Language**: TypeScript

## Folder Structure

```
architech-crm/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Login pages
│   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   ├── admin/    # Admin/Agency dashboard
│   │   │   └── portal/   # Client portal
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   └── layout/       # Navigation, headers
│   ├── lib/              # Utilities and helpers
│   │   ├── supabase/     # Supabase client
│   │   ├── utils.ts      # Helper functions
│   │   └── constants.ts  # App constants
│   └── types/            # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
└── scripts/
    └── seed.ts           # Seed data script
```

## Connecting to Your Website

To link this CRM from your agency website:

### Option 1: Direct Link
Add a link in your website's navigation:
```html
<a href="https://your-crm-domain.com/login">Client Portal</a>
```

### Option 2: Embed in Iframe (for subdomain)
1. Deploy CRM to a subdomain like crm.architechdesigns.com
2. Add to your main site:
```html
<iframe src="https://crm.architechdesigns.com" style="border:none;width:100%;height:100vh;"></iframe>
```

### Option 3: Lead Capture Form
Create a form on your website that submits to the CRM:
- Use a Next.js API route in this project to handle form submissions
- Or use Supabase directly to insert into the `leads` table

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## Future Upgrades

- Stripe integration for invoice payments
- Email notifications (SendGrid/Resend)
- Calendar integration for appointments
- Proposal/contract e-signature (HelloSign/DocuSign)
- Advanced reporting and analytics
- Mobile app

## License

MIT - Architech Designs LLC