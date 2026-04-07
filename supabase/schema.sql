-- Architech Designs CRM - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create policy for users to update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service_interest VARCHAR(255),
  source VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  notes TEXT,
  estimated_value DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert leads" ON leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads" ON leads
  FOR UPDATE TO authenticated USING (true);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  lead_id UUID REFERENCES leads(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert clients" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" ON clients
  FOR UPDATE TO authenticated USING (true);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  package_type VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'onboarding',
  progress_percentage INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE TO authenticated USING (true);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  due_date DATE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks" ON tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" ON tasks
  FOR UPDATE TO authenticated USING (true);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view milestones" ON milestones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert milestones" ON milestones
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update milestones" ON milestones
  FOR UPDATE TO authenticated USING (true);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view files" ON files
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert files" ON files
  FOR INSERT TO authenticated WITH CHECK (true);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  invoice_number VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoices" ON invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert invoices" ON invoices
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices" ON invoices
  FOR UPDATE TO authenticated USING (true);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view messages" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (true);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity logs" ON activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activity logs" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Onboarding items table
CREATE TABLE IF NOT EXISTS onboarding_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

ALTER TABLE onboarding_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view onboarding items" ON onboarding_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert onboarding items" ON onboarding_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update onboarding items" ON onboarding_items
  FOR UPDATE TO authenticated USING (true);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings" ON settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update settings" ON settings
  FOR UPDATE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_client_id ON files(client_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_onboarding_items_client_id ON onboarding_items(client_id);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('agency_name', '"Architech Designs LLC"'),
  ('agency_website', '"https://architechdesigns.com"'),
  ('agency_email', '"hello@architechdesigns.com"'),
  ('agency_phone', '"+1 (555) 123-4567"'),
  ('package_types', '[
    {"name": "Basic Website", "price": 2500, "description": "5-page website with basic features"},
    {"name": "Premium Website", "price": 5000, "description": "10-page website with advanced features"},
    {"name": "Growth Package", "price": 8000, "description": "Full digital marketing package"},
    {"name": "Custom Package", "price": null, "description": "Tailored to client needs"}
  ]'),
  ('lead_statuses', '["new", "contacted", "discovery", "proposal", "won", "lost"]'),
  ('project_statuses', '["onboarding", "planning", "design", "development", "revisions", "launch", "completed"]')
ON CONFLICT (key) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically create a user record when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable PostgreSQL extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Execute this to create indexes (run manually if needed)
-- This helps with foreign key lookups

COMMENT ON TABLE users IS 'User profiles extending Supabase auth';
COMMENT ON TABLE leads IS 'Sales leads and prospects';
COMMENT ON TABLE clients IS 'Client companies';
COMMENT ON TABLE projects IS 'Client projects';
COMMENT ON TABLE tasks IS 'Project tasks';
COMMENT ON TABLE milestones IS 'Project milestones';
COMMENT ON TABLE files IS 'Uploaded files and documents';
COMMENT ON TABLE invoices IS 'Client invoices';
COMMENT ON TABLE messages IS 'Project messages and updates';
COMMENT ON TABLE activity_logs IS 'Activity tracking for audit trail';
COMMENT ON TABLE onboarding_items IS 'Client onboarding checklist items';
COMMENT ON TABLE settings IS 'Agency settings and configuration';

-- Log successful schema creation
SELECT '✅ Database schema created successfully!' AS status;