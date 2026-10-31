import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = 
  Boolean(supabaseUrl) && 
  !supabaseUrl.includes('your-project-ref') &&
  Boolean(supabaseAnonKey) &&
  !supabaseAnonKey.includes('your_supabase_anon_key');

/**
 * Public Anonymous Supabase Browser Client
 * Built for Vercel Client Link Up, utilizing public anon key and project URL.
 */
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Diagnostic helper to check Supabase configuration on client
 */
export const getClientSupabaseStatus = () => ({
  configured: isConfigured,
  url: supabaseUrl || 'Not configured in VITE_SUPABASE_URL',
  hasAnonKey: Boolean(supabaseAnonKey),
  mode: isConfigured ? 'Direct Supabase Cloud Connected' : 'Local / Backend API Mode'
});

export default supabase;

