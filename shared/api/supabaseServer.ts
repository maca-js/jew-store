import { createClient } from '@supabase/supabase-js'

// Server-only client with service role key — never import on the client side
export function createServerSupabase() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const url = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co'
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder')
}
