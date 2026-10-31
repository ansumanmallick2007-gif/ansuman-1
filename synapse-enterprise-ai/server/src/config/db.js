import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;
let isSupabasePostgres = false;

// ============================================================
// In-Memory Fallback Store — used when no DATABASE_URL is set
// ============================================================
export const inMemoryStore = {
  users: [],
  documents: [],
  workflows: [],
  audit_logs: []
};

const seedInMemoryStore = async () => {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Synapse2026!', salt);

  const adminId       = '11111111-1111-4111-a111-111111111111';
  const financeId     = '22222222-2222-4222-a222-222222222222';
  const engId         = '33333333-3333-4333-a333-333333333333';
  const employeeId    = '44444444-4444-4444-a444-444444444444';
  const doc1Id        = 'a0a0a0a0-a0a0-4a0a-a0a0-a0a0a0a0a001';
  const doc2Id        = 'b0b0b0b0-b0b0-4b0b-b0b0-b0b0b0b0b002';
  const doc3Id        = 'c0c0c0c0-c0c0-4c0c-c0c0-c0c0c0c0c003';
  const wf1Id         = 'd0d0d0d0-d0d0-4d0d-d0d0-d0d0d0d0d001';
  const wf2Id         = 'e0e0e0e0-e0e0-4e0e-e0e0-e0e0e0e0e002';

  inMemoryStore.users = [
    { id: adminId,    name: 'Sarah Connor (Executive Admin)', email: 'admin@synapse.ai',        password_hash: passwordHash, role: 'admin',    department: 'operations', created_at: new Date(Date.now() - 30*86400000).toISOString() },
    { id: financeId,  name: 'Marcus Vance (Finance Lead)',    email: 'finance.lead@synapse.ai', password_hash: passwordHash, role: 'manager',  department: 'finance',    created_at: new Date(Date.now() - 25*86400000).toISOString() },
    { id: engId,      name: 'Elena Rostova (VP Engineering)', email: 'eng.lead@synapse.ai',     password_hash: passwordHash, role: 'manager',  department: 'engineering',created_at: new Date(Date.now() - 20*86400000).toISOString() },
    { id: employeeId, name: 'Alex Rivera (Staff Engineer)',   email: 'employee@synapse.ai',     password_hash: passwordHash, role: 'employee', department: 'engineering',created_at: new Date(Date.now() - 15*86400000).toISOString() }
  ];

  inMemoryStore.documents = [
    {
      id: doc1Id,
      title: 'Q3 Financial Health & EBITDA Reconciliation',
      department: 'finance', file_type: 'Financial Report',
      raw_content: 'Q3 EBITDA margin expanded 320 bps YoY to 28.4%. Operating cash flow reached $42.5M, driven by enterprise ARR growth of 41%.',
      ai_summary: 'Enterprise ARR +41% YoY, EBITDA 28.4% ($42.5M OCF). Q4 hiring capped at 5%.',
      extracted_entities: { financials: ['$42.5M OCF', '28.4% EBITDA', '+41% ARR'] },
      uploaded_by: financeId, created_at: new Date(Date.now() - 5*86400000).toISOString()
    },
    {
      id: doc2Id,
      title: 'Global Remote Work & Compliance Framework 2026',
      department: 'hr', file_type: 'HR Policy',
      raw_content: 'This policy governs all asynchronous distributed workers across 14 jurisdictions.',
      ai_summary: 'Distributed work governance: security tokens by Nov 15, AI ethics by Dec 1.',
      extracted_entities: { mandates: ['Hardware keys Nov 15', 'AI ethics Dec 1'] },
      uploaded_by: adminId, created_at: new Date(Date.now() - 3*86400000).toISOString()
    },
    {
      id: doc3Id,
      title: 'Microservices Mesh & Zero-Trust Architecture Spec',
      department: 'engineering', file_type: 'Technical Spec',
      raw_content: 'Migration from legacy monolithic gateway to Envoy-based Service Mesh with mTLS.',
      ai_summary: 'Service mesh overhaul using Envoy mTLS targeting <18ms p99 latency.',
      extracted_entities: { technologies: ['Envoy', 'mTLS', 'Gemini'] },
      uploaded_by: engId, created_at: new Date(Date.now() - 2*86400000).toISOString()
    }
  ];

  inMemoryStore.workflows = [
    {
      id: wf1Id,
      title: 'Audit & Automate Cross-Border Tax Filings',
      description: 'Reconcile multi-currency sales ledger across EMEA and APAC branches.',
      department: 'finance', status: 'in_progress', priority: 'critical',
      assigned_to: financeId,
      ai_suggestions: { recommendedSubtasks: [{ title: 'Extract VAT logs', estimatedHours: 4, suggestedDepartment: 'finance' }], riskAssessment: 'FX volatility risk at 2.3%.' },
      due_date: new Date(Date.now() + 5*86400000).toISOString(), created_at: new Date(Date.now() - 4*86400000).toISOString()
    },
    {
      id: wf2Id,
      title: 'Deploy Gemini Multimodal Extraction Service v2',
      description: 'Upgrade document ingestion pipeline for high-throughput financial statements.',
      department: 'engineering', status: 'review', priority: 'high',
      assigned_to: employeeId,
      ai_suggestions: { recommendedSubtasks: [{ title: 'Implement Zod schemas', estimatedHours: 6, suggestedDepartment: 'engineering' }], riskAssessment: 'Token spike risk on large batch imports.' },
      due_date: new Date(Date.now() + 3*86400000).toISOString(), created_at: new Date(Date.now() - 6*86400000).toISOString()
    }
  ];

  inMemoryStore.audit_logs = [
    { id: uuidv4(), user_id: adminId, action: 'INIT_SYSTEM', details: { message: 'Synapse Enterprise AI initialized' }, created_at: new Date(Date.now() - 30*86400000).toISOString() },
    { id: uuidv4(), user_id: financeId, action: 'INGEST_DOCUMENT', details: { documentTitle: 'Q3 Financial Health', department: 'finance' }, created_at: new Date(Date.now() - 5*86400000).toISOString() }
  ];
};

// ============================================================
// Database Initialization
// ============================================================
export const initDB = async () => {
  await seedInMemoryStore();

  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_DIRECT_URL;
  if (!connectionString || connectionString.includes('yourpassword') || connectionString.includes('yourprojectref')) {
    console.log('[Database] No valid DATABASE_URL. Running in resilient in-memory mode with demo data.');
    return;
  }

  isSupabasePostgres = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase');

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
      ssl: isSupabasePostgres || process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false
    });

    const client = await pool.connect();
    isPostgresConnected = true;
    console.log(`[Database] Connected to ${isSupabasePostgres ? 'Supabase Cloud PostgreSQL' : 'PostgreSQL'}.`);

    // Auto-create schema
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
              CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'department_type') THEN
              CREATE TYPE department_type AS ENUM ('finance', 'hr', 'engineering', 'operations', 'product');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
              CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
              CREATE TYPE task_status AS ENUM ('backlog', 'in_progress', 'review', 'completed');
          END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role user_role DEFAULT 'employee',
          department department_type NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          department department_type NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          raw_content TEXT NOT NULL,
          ai_summary TEXT,
          extracted_entities JSONB,
          uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workflows (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          department department_type NOT NULL,
          status task_status DEFAULT 'backlog',
          priority task_priority DEFAULT 'medium',
          assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
          ai_suggestions JSONB,
          due_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(255) NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed users if empty
    const existingUsers = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count, 10) === 0) {
      console.log('[Database] Seeding PostgreSQL with demo data...');
      for (const u of inMemoryStore.users) {
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, role, department, created_at)
           VALUES ($1, $2, $3, $4, $5::user_role, $6::department_type, $7) ON CONFLICT (email) DO NOTHING`,
          [u.id, u.name, u.email, u.password_hash, u.role, u.department, u.created_at]
        );
      }
      for (const d of inMemoryStore.documents) {
        await client.query(
          `INSERT INTO documents (id, title, department, file_type, raw_content, ai_summary, extracted_entities, uploaded_by, created_at)
           VALUES ($1, $2, $3::department_type, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [d.id, d.title, d.department, d.file_type, d.raw_content, d.ai_summary, JSON.stringify(d.extracted_entities), d.uploaded_by, d.created_at]
        );
      }
      for (const w of inMemoryStore.workflows) {
        await client.query(
          `INSERT INTO workflows (id, title, description, department, status, priority, assigned_to, ai_suggestions, due_date, created_at)
           VALUES ($1, $2, $3, $4::department_type, $5::task_status, $6::task_priority, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [w.id, w.title, w.description, w.department, w.status, w.priority, w.assigned_to, JSON.stringify(w.ai_suggestions), w.due_date, w.created_at]
        );
      }
      console.log('[Database] Seed complete.');
    }
    client.release();
  } catch (err) {
    console.warn(`[Database] PostgreSQL connection failed: ${err.message}. Falling back to in-memory mode.`);
    isPostgresConnected = false;
    pool = null;
  }
};

// ============================================================
// Universal Query Interface
// ============================================================
export const query = async (text, params = []) => {
  if (isPostgresConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (pgErr) {
      console.error('[DB PG Error]:', pgErr.message);
      throw pgErr;
    }
  }
  return executeInMemoryQuery(text, params);
};

// ============================================================
// In-Memory SQL Emulator
// ============================================================
const executeInMemoryQuery = (text, params) => {
  const q = text.trim().toLowerCase().replace(/\s+/g, ' ');

  // SELECT users
  if (q.startsWith('select') && q.includes('from users')) {
    if (q.includes('count(*)')) return { rows: [{ count: String(inMemoryStore.users.length) }] };
    if (q.includes('where email = $1')) {
      const user = inMemoryStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
      return { rows: user ? [user] : [] };
    }
    if (q.includes('where id = $1')) {
      const user = inMemoryStore.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [] };
    }
    return { rows: [...inMemoryStore.users] };
  }

  // INSERT users
  if (q.startsWith('insert into users')) {
    // Check for duplicate email first
    const emailIndex = params.indexOf(params[1]);
    const existingEmail = inMemoryStore.users.find(u => u.email.toLowerCase() === (params[1] || '').toLowerCase());
    if (existingEmail) throw Object.assign(new Error('duplicate key value'), { code: '23505' });
    const newUser = {
      id: uuidv4(),
      name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'employee',
      department: params[4],
      created_at: new Date().toISOString()
    };
    inMemoryStore.users.push(newUser);
    return { rows: [newUser] };
  }

  // SELECT documents
  if (q.startsWith('select') && q.includes('from documents')) {
    let docs = [...inMemoryStore.documents];
    if (q.includes('where id = $1')) docs = docs.filter(d => d.id === params[0]);
    else if (q.includes('where department = $1')) docs = docs.filter(d => d.department === params[0]);
    const enriched = docs.map(d => {
      const u = inMemoryStore.users.find(u => u.id === d.uploaded_by);
      return { ...d, uploader_name: u ? u.name : 'System', uploader_email: u ? u.email : 'system@synapse.ai' };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  // INSERT documents
  if (q.startsWith('insert into documents')) {
    const newDoc = {
      id: uuidv4(),
      title: params[0], department: params[1], file_type: params[2],
      raw_content: params[3], ai_summary: params[4],
      extracted_entities: typeof params[5] === 'string' ? JSON.parse(params[5]) : (params[5] || {}),
      uploaded_by: params[6], created_at: new Date().toISOString()
    };
    inMemoryStore.documents.unshift(newDoc);
    return { rows: [newDoc] };
  }

  // DELETE documents
  if (q.startsWith('delete from documents')) {
    const idx = inMemoryStore.documents.findIndex(d => d.id === params[0]);
    if (idx !== -1) { const [removed] = inMemoryStore.documents.splice(idx, 1); return { rows: [removed] }; }
    return { rows: [] };
  }

  // SELECT workflows
  if (q.startsWith('select') && q.includes('from workflows')) {
    let wfs = [...inMemoryStore.workflows];
    if (q.includes('where id = $1')) wfs = wfs.filter(w => w.id === params[0]);
    else if (q.includes('where department = $1')) wfs = wfs.filter(w => w.department === params[0]);
    const enriched = wfs.map(w => {
      const u = inMemoryStore.users.find(u => u.id === w.assigned_to);
      return { ...w, assignee_name: u ? u.name : 'Unassigned', assignee_email: u ? u.email : null };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  // INSERT workflows
  if (q.startsWith('insert into workflows')) {
    const newWf = {
      id: uuidv4(),
      title: params[0], description: params[1], department: params[2],
      status: params[3] || 'backlog', priority: params[4] || 'medium',
      assigned_to: params[5] || null,
      ai_suggestions: typeof params[6] === 'string' ? JSON.parse(params[6]) : (params[6] || {}),
      due_date: params[7] ? new Date(params[7]).toISOString() : null,
      created_at: new Date().toISOString()
    };
    inMemoryStore.workflows.unshift(newWf);
    return { rows: [newWf] };
  }

  // UPDATE workflows
  if (q.startsWith('update workflows')) {
    const id = params[params.length - 1];
    const wf = inMemoryStore.workflows.find(w => w.id === id);
    if (wf) {
      if (q.includes('status') && params[0] !== undefined) wf.status = params[0];
      if (q.includes('assigned_to') && params[1] !== undefined) wf.assigned_to = params[1];
      return { rows: [wf] };
    }
    return { rows: [] };
  }

  // DELETE workflows
  if (q.startsWith('delete from workflows')) {
    const idx = inMemoryStore.workflows.findIndex(w => w.id === params[0]);
    if (idx !== -1) { const [removed] = inMemoryStore.workflows.splice(idx, 1); return { rows: [removed] }; }
    return { rows: [] };
  }

  // INSERT audit_logs
  if (q.startsWith('insert into audit_logs')) {
    const log = {
      id: uuidv4(), user_id: params[0], action: params[1],
      details: typeof params[2] === 'string' ? JSON.parse(params[2]) : (params[2] || {}),
      created_at: new Date().toISOString()
    };
    inMemoryStore.audit_logs.unshift(log);
    return { rows: [log] };
  }

  // SELECT audit_logs
  if (q.startsWith('select') && q.includes('from audit_logs')) {
    const enriched = inMemoryStore.audit_logs.map(log => {
      const u = inMemoryStore.users.find(u => u.id === log.user_id);
      return { ...log, user_name: u ? u.name : 'System', user_email: u ? u.email : 'system@synapse.ai', user_role: u ? u.role : 'system' };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  return { rows: [] };
};

export const getDbStatus = () => ({
  mode: isPostgresConnected
    ? (isSupabasePostgres ? 'Supabase Cloud PostgreSQL' : 'PostgreSQL')
    : 'In-Memory Enterprise Engine (Demo Mode)',
  isPostgresConnected,
  isSupabase: isSupabasePostgres,
  recordCounts: {
    users: inMemoryStore.users.length,
    documents: inMemoryStore.documents.length,
    workflows: inMemoryStore.workflows.length,
    audit_logs: inMemoryStore.audit_logs.length
  }
});

export default { query, initDB, getDbStatus };
