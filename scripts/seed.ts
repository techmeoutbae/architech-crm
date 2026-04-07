import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log("Seeding database...")

  const adminEmail = "admin@architechdesigns.com"
  const teamEmail = "team@architechdesigns.com"
  const clientEmail = "client@acmecorp.com"

  // Create admin user
  const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: "password123",
    email_confirm: true,
    user_metadata: { full_name: "Lilly Admin" },
  })

  if (adminError && !adminError.message.includes("already been registered")) {
    console.error("Admin user error:", adminError)
  }

  if (adminUser?.user) {
    await supabase.from("users").upsert({
      id: adminUser.user.id,
      email: adminEmail,
      full_name: "Lilly Admin",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log("Admin user created:", adminEmail)
  }

  // Create team user
  const { data: teamUser, error: teamError } = await supabase.auth.admin.createUser({
    email: teamEmail,
    password: "password123",
    email_confirm: true,
    user_metadata: { full_name: "Alex Team" },
  })

  if (teamError && !teamError.message.includes("already been registered")) {
    console.error("Team user error:", teamError)
  }

  if (teamUser?.user) {
    await supabase.from("users").upsert({
      id: teamUser.user.id,
      email: teamEmail,
      full_name: "Alex Team",
      role: "team",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log("Team user created:", teamEmail)
  }

  // Create client user
  const { data: clientUser, error: clientUserError } = await supabase.auth.admin.createUser({
    email: clientEmail,
    password: "password123",
    email_confirm: true,
    user_metadata: { full_name: "John Smith" },
  })

  if (clientUserError && !clientUserError.message.includes("already been registered")) {
    console.error("Client user error:", clientUserError)
  }

  let clientUserId = clientUser?.user?.id

  // If client user already exists, get their ID
  if (!clientUserId) {
    const { data: existingClient } = await supabase
      .from("users")
      .select("id")
      .eq("email", clientEmail)
      .single()
    clientUserId = existingClient?.id
  }

  if (clientUserId) {
    await supabase.from("users").upsert({
      id: clientUserId,
      email: clientEmail,
      full_name: "John Smith",
      role: "client",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log("Client user created:", clientEmail)

    // Create client record
    await supabase.from("clients").upsert({
      user_id: clientUserId,
      business_name: "Acme Corporation",
      contact_name: "John Smith",
      email: clientEmail,
      phone: "+1 (555) 987-6543",
      address: "456 Business Ave, New York, NY 10001",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log("Client record created: Acme Corporation")
  }

  // Create leads
  const leads = [
    {
      business_name: "TechStart Inc",
      contact_name: "Sarah Johnson",
      email: "sarah@techstart.io",
      phone: "+1 (555) 111-2222",
      service_interest: "Premium Website",
      source: "Website Form",
      status: "new",
      notes: "Interested in a full website redesign",
      estimated_value: 5000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      business_name: "GreenLeaf Restaurant",
      contact_name: "Mike Chen",
      email: "mike@greenleaf.com",
      phone: "+1 (555) 333-4444",
      service_interest: "Basic Website",
      source: "Referral",
      status: "contacted",
      notes: "Needs a simple website for their restaurant",
      estimated_value: 2500,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      business_name: "Fitness Pro Gym",
      contact_name: "Lisa Brown",
      email: "lisa@fitnesspro.com",
      phone: "+1 (555) 555-6666",
      service_interest: "Growth Package",
      source: "Google Ads",
      status: "discovery",
      notes: "Looking for full digital marketing package",
      estimated_value: 8000,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      business_name: "Creative Studio",
      contact_name: "David Lee",
      email: "david@creativestudio.co",
      service_interest: "Premium Website",
      source: "Social Media",
      status: "proposal",
      notes: "Proposal sent on March 15",
      estimated_value: 6000,
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      business_name: "Sunrise Bakery",
      contact_name: "Emma Wilson",
      email: "emma@sunrisebakery.com",
      phone: "+1 (555) 777-8888",
      service_interest: "Basic Website",
      source: "Referral",
      status: "won",
      notes: "Contract signed, project starting April 1",
      estimated_value: 2500,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  for (const lead of leads) {
    await supabase.from("leads").upsert(lead)
  }
  console.log("Leads created:", leads.length)

  // Create a client for the project
  const { data: clientData } = await supabase
    .from("clients")
    .select("id")
    .eq("business_name", "Acme Corporation")
    .single()

  if (clientData?.id) {
    // Create project
    const project = {
      client_id: clientData.id,
      name: "Acme Corp Website Redesign",
      package_type: "premium",
      status: "design",
      progress_percentage: 45,
      start_date: "2026-03-01",
      end_date: "2026-05-01",
      budget: 5000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: projectData } = await supabase.from("projects").insert(project).select().single()
    console.log("Project created: Acme Corp Website Redesign")

    if (projectData?.id) {
      // Create tasks
      const tasks = [
        { project_id: projectData.id, title: "Discovery Call", description: "Initial requirements gathering", status: "completed", due_date: "2026-03-05" },
        { project_id: projectData.id, title: "Wireframes", description: "Create wireframes for all pages", status: "completed", due_date: "2026-03-15" },
        { project_id: projectData.id, title: "Design Mockups", description: "Create visual design mockups", status: "in_progress", due_date: "2026-03-25" },
        { project_id: projectData.id, title: "Development", description: "Build the website", status: "pending", due_date: "2026-04-15" },
        { project_id: projectData.id, title: "Testing", description: "QA and testing", status: "pending", due_date: "2026-04-25" },
        { project_id: projectData.id, title: "Launch", description: "Deploy to production", status: "pending", due_date: "2026-05-01" },
      ]

      await supabase.from("tasks").insert(tasks)
      console.log("Tasks created:", tasks.length)

      // Create milestones
      const milestones = [
        { project_id: projectData.id, name: "Discovery Complete", description: "Requirements finalized", status: "completed", completed_at: new Date().toISOString() },
        { project_id: projectData.id, name: "Design Approval", description: "Client approves final designs", status: "in_progress" },
        { project_id: projectData.id, name: "Development Complete", description: "All pages built and tested", status: "pending" },
        { project_id: projectData.id, name: "Launch", description: "Site goes live", status: "pending" },
      ]

      await supabase.from("milestones").insert(milestones)
      console.log("Milestones created:", milestones.length)

      // Create messages
      const messages = [
        { project_id: projectData.id, user_id: adminUser?.user?.id, content: "Welcome to your project! We're excited to work with you.", is_internal: false, created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { project_id: projectData.id, user_id: adminUser?.user?.id, content: "Discovery call scheduled for March 5th at 2pm.", is_internal: false, created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { project_id: projectData.id, user_id: clientUserId, content: "Great, looking forward to it!", is_internal: false, created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { project_id: projectData.id, user_id: adminUser?.user?.id, content: "Wireframes are ready for review.", is_internal: false, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      ]

      await supabase.from("messages").insert(messages)
      console.log("Messages created:", messages.length)
    }

    // Create invoices
    const invoices = [
      {
        client_id: clientData.id,
        project_id: projectData?.id,
        invoice_number: "INV-001",
        amount: 2500,
        status: "paid",
        due_date: "2026-03-15",
        paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "50% upfront payment",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        client_id: clientData.id,
        project_id: projectData?.id,
        invoice_number: "INV-002",
        amount: 2500,
        status: "sent",
        due_date: "2026-04-15",
        notes: "Remaining 50% upon completion",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    await supabase.from("invoices").insert(invoices)
    console.log("Invoices created:", invoices.length)
  }

  console.log("\n✅ Seed completed!")
  console.log("\nTest accounts:")
  console.log("  Admin: admin@architechdesigns.com / password123")
  console.log("  Team:  team@architechdesigns.com / password123")
  console.log("  Client: client@acmecorp.com / password123")
}

seed().catch(console.error)