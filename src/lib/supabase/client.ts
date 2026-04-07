import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://glfztcujpgyivhftxexr.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZnp0Y3VqcGd5aXZoZnR4ZXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODAxNDAsImV4cCI6MjA5MTE1NjE0MH0.DA4j8z6dU21aJ-ofcvo-IXTilhbrZHPJhk7a7sUB1bo'
  )
}