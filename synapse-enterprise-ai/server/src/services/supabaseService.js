import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';

/**
 * High-level Supabase Service Operations
 * Leverages @supabase/supabase-js with service role elevation for secure server tasks
 */

export const getSupabaseDocuments = async (department) => {
  if (!supabaseAdmin) return null;

  let query = supabaseAdmin
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (department && department !== 'all') {
    query = query.eq('department', department);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Supabase Service] getDocuments Error:', error.message);
    throw error;
  }
  return data;
};

export const insertSupabaseDocument = async (docPayload) => {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert([
      {
        title: docPayload.title,
        department: docPayload.department,
        file_type: docPayload.fileType,
        raw_content: docPayload.content,
        ai_summary: docPayload.aiSummary,
        extracted_entities: docPayload.extractedEntities,
        uploaded_by: docPayload.uploadedBy
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('[Supabase Service] insertDocument Error:', error.message);
    throw error;
  }
  return data;
};

export const getSupabaseWorkflows = async (department, status) => {
  if (!supabaseAdmin) return null;

  let query = supabaseAdmin
    .from('workflows')
    .select('*')
    .order('created_at', { ascending: false });

  if (department && department !== 'all') {
    query = query.eq('department', department);
  }
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Supabase Service] getWorkflows Error:', error.message);
    throw error;
  }
  return data;
};

export const logSupabaseAudit = async (userId, action, details) => {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert([
        {
          user_id: userId || null,
          action,
          details
        }
      ])
      .select()
      .single();

    return data;
  } catch (err) {
    console.warn('[Supabase Service] Audit log failed:', err.message);
    return null;
  }
};

export default {
  getSupabaseDocuments,
  insertSupabaseDocument,
  getSupabaseWorkflows,
  logSupabaseAudit
};
