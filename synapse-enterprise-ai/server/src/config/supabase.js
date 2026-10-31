import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = 
  Boolean(supabaseUrl) && 
  !supabaseUrl.includes('your-project-ref') &&
  Boolean(supabaseAnonKey) &&
  !supabaseAnonKey.includes('your_supabase_anon_key');

/**
 * Public Anonymous Supabase Client
 * Respects Row Level Security (RLS) policies.
 */
export const supabaseAnon = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * Elevated Service Role Supabase Client
 * Possesses admin privileges to bypass RLS for trusted backend server-side operations,
 * automated document extraction indexing, and cross-departmental administrative audit logs.
 */
export const supabaseAdmin = (isConfigured && supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('your_supabase_service_role'))
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : supabaseAnon;

/**
 * Diagnostic helper to check connection status to Supabase
 */
export const checkSupabaseHealth = async () => {
  if (!isConfigured) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials not configured in backend/.env. Using resilient local engine.'
    };
  }

  try {
    const client = supabaseAdmin || supabaseAnon;
    const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        configured: true,
        error: error.message,
        message: `Supabase reachable but query returned error: ${error.message}`
      };
    }

    return {
      connected: true,
      configured: true,
      url: supabaseUrl,
      message: 'Supabase connected successfully (Cloud PostgreSQL + Realtime).'
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      error: err.message,
      message: `Failed to connect to Supabase: ${err.message}`
    };
  }
};

export default {
  supabaseAnon,
  supabaseAdmin,
  checkSupabaseHealth
};
