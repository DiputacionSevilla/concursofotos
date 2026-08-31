import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database'

/**
 * Cliente con service_role: bypassa RLS. Solo para uso server-side
 * (signed URLs de la galeria publica, operaciones admin puntuales).
 * `import 'server-only'` hace fallar el build si esto se importa desde un client component.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
