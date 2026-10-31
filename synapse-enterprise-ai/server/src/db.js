import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { checkSupabaseHealth } from './supabase.js';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;
let isSupabasePostgres = false;

// Robust In-Memory Fallback Store pre-populated with enterprise data
export const inMemoryStore = {
  users: [],
  documents: [],
  workflows: [],
  audit_logs: []
};

// Seed in-memory store with demo users & data
const seedInMemoryStore = async () => {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Synapse2026!', salt);

  const adminId = '11111111-1111-4111-a111-111111111111';
  const managerFinanceId = '22222222-2222-4222-a222-222222222222';
  const managerEngId = '33333333-3333-4333-a333-333333333333';
  const employeeId = '44444444-4444-4444-a444-444444444444';

  inMemoryStore.users = [
    {
      id: adminId,
      name: 'Sarah Connor (Executive Admin)',
      email: 'admin@synapse.ai',
      password_hash: passwordHash,
      role: 'admin',
      department: 'operations',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: managerFinanceId,
      name: 'Marcus Vance (Finance Lead)',
      email: 'finance.lead@synapse.ai',
      password_hash: passwordHash,
      role: 'manager',
      department: 'finance',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: managerEngId,
      name: 'Elena Rostova (VP Engineering)',
      email: 'eng.lead@synapse.ai',
      password_hash: passwordHash,
      role: 'manager',
      department: 'engineering',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: employeeId,
      name: 'Alex Rivera (Staff Engineer)',
      email: 'employee@synapse.ai',
      password_hash: passwordHash,
      role: 'employee',
      department: 'engineering',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  inMemoryStore.documents = [
    {
      id: 'doc-001-uuid',
      title: 'Q3 Financial Health & EBITDA Reconciliation',
      department: 'finance',
      file_type: 'Financial Report',
      raw_content: 'Q3 EBITDA margin expanded 320 bps YoY to 28.4%. Operating cash flow reached $42.5M, driven by enterprise ARR growth of 41%. Cloud infrastructure expenditure was reduced by 14% via model distillation and automated query routing. Headcount growth is capped at 5% for Q4.',
      ai_summary: 'Enterprise ARR increased 41% YoY with EBITDA margin reaching 28.4% ($42.5M OCF). Cloud compute costs dropped 14% via model optimizations. Q4 hiring capped at 5%.',
      extracted_entities: {
        financials: ['$42.5M Operating Cash Flow', '28.4% EBITDA Margin', '+41% ARR Growth'],
        initiatives: ['Cloud compute efficiency', 'Distillation routing'],
        timeline: ['Q3 Results', 'Q4 Headcount Constraint']
      },
      uploaded_by: managerFinanceId,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'doc-002-uuid',
      title: 'Global Remote Work & Compliance Framework 2026',
      department: 'hr',
      file_type: 'HR Policy',
      raw_content: 'This policy governs all asynchronous distributed workers across 14 jurisdictions. Mandatory security token hardware keys required by November 15. Annual training for AI ethics and customer data governance must be completed by all staff before Dec 1.',
      ai_summary: 'Distributed work governance covering 14 jurisdictions. Hard deadlines for hardware security tokens (Nov 15) and AI ethics/data compliance certification (Dec 1).',
      extracted_entities: {
        mandates: ['Hardware security keys by Nov 15', 'AI ethics certification by Dec 1'],
        scope: ['14 global jurisdictions', 'All full-time and contract personnel']
      },
      uploaded_by: adminId,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'doc-003-uuid',
      title: 'Microservices Mesh & Zero-Trust Architecture Spec',
      department: 'engineering',
      file_type: 'Technical Spec',
      raw_content: 'Migration from legacy monolithic gateway to Envoy-based Service Mesh with mTLS. Target p99 latency < 18ms. Gemini model gateway failover will utilize regional fallback clusters in us-east and europe-west.',
      ai_summary: 'Service mesh overhaul using Envoy and mTLS targeting <18ms p99 latency. Incorporates automated regional failover clusters for high-availability Gemini API inference.',
      extracted_entities: {
        performanceTarget: ['p99 latency < 18ms'],
        technologies: ['Envoy', 'mTLS', 'Google Gemini 2.5 Flash', 'Regional Failover'],
        regions: ['us-east', 'europe-west']
      },
      uploaded_by: managerEngId,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  inMemoryStore.workflows = [
    {
      id: 'wf-001-uuid',
      title: 'Audit & Automate Cross-Border Tax Filings',
      description: 'Reconcile multi-currency sales ledger across EMEA and APAC branches with automated Gemini discrepancy checks.',
      department: 'finance',
      status: 'in_progress',
      priority: 'critical',
      assigned_to: managerFinanceId,
      ai_suggestions: {
        recommendedSubtasks: [
          { title: 'Extract VAT transaction logs via Synapse Document parser', estimatedHours: 4, suggestedDepartment: 'finance' },
          { title: 'Flag variance above $5,000 using Gemini reconciliation rules', estimatedHours: 6, suggestedDepartment: 'finance' },
          { title: 'Validate compliant filing receipt with external audit partner', estimatedHours: 8, suggestedDepartment: 'operations' }
        ],
        riskAssessment: 'Foreign exchange volatility in late-quarter filings could induce up to 2.3% variance if unhedged.'
      },
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'wf-002-uuid',
      title: 'Deploy Gemini Multimodal Extraction Service v2',
      description: 'Upgrade document ingestion pipeline to support high-throughput financial statements and real-time structured telemetry parsing.',
      department: 'engineering',
      status: 'review',
      priority: 'high',
      assigned_to: employeeId,
      ai_suggestions: {
        recommendedSubtasks: [
          { title: 'Implement structured schema verification with Zod and @google/genai', estimatedHours: 6, suggestedDepartment: 'engineering' },
          { title: 'Run automated regression benchmark against 500 enterprise sample PDFs', estimatedHours: 8, suggestedDepartment: 'product' },
          { title: 'Configure regional failover and telemetry alerting', estimatedHours: 4, suggestedDepartment: 'operations' }
        ],
        riskAssessment: 'Large PDF OCR batch sizes could cause token spike; ensure rate limiting and backoff retry logic is enabled.'
      },
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'wf-003-uuid',
      title: 'Employee Onboarding & Security Key Rollout',
      description: 'Distribute hardware authentication tokens and conduct AI data safety training for 120 new hires across departments.',
      department: 'hr',
      status: 'backlog',
      priority: 'medium',
      assigned_to: adminId,
      ai_suggestions: {
        recommendedSubtasks: [
          { title: 'Distribute hardware FIDO2 keys and log serial numbers', estimatedHours: 12, suggestedDepartment: 'hr' },
          { title: 'Deploy interactive AI security compliance quiz on Synapse Portal', estimatedHours: 5, suggestedDepartment: 'engineering' }
        ],
        riskAssessment: 'Shipping delays to remote employees in APAC may delay the Dec 1 mandatory compliance cutoff.'
      },
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'wf-004-uuid',
      title: 'Enterprise SOC2 Type II Audit Preparation',
      description: 'Consolidate access logs, automated change management tickets, and AI inference audit trails for external reviewers.',
      department: 'operations',
      status: 'completed',
      priority: 'high',
      assigned_to: adminId,
      ai_suggestions: {
        recommendedSubtasks: [
          { title: 'Generate unified audit log export for past 365 days', estimatedHours: 3, suggestedDepartment: 'operations' },
          { title: 'Verify immutable AI logging and data isolation controls', estimatedHours: 5, suggestedDepartment: 'engineering' }
        ],
        riskAssessment: 'Ensure all third-party API keys are strictly masked in exported telemetry.'
      },
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  inMemoryStore.audit_logs = [
    {
      id: uuidv4(),
      user_id: adminId,
      action: 'INIT_SYSTEM',
      details: { message: 'Synapse Enterprise AI Platform initialized with enterprise security controls' },
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: managerFinanceId,
      action: 'INGEST_DOCUMENT',
      details: { documentTitle: 'Q3 Financial Health & EBITDA Reconciliation', department: 'finance' },
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: managerEngId,
      action: 'CREATE_WORKFLOW',
      details: { workflowTitle: 'Deploy Gemini Multimodal Extraction Service v2', priority: 'high' },
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Initialize DB or fallback
export const initDB = async () => {
  await seedInMemoryStore();

  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_DIRECT_URL;
  if (!connectionString) {
    console.log('[Database] No DATABASE_URL provided. Running in resilient enterprise in-memory mode.');
    return;
  }

  isSupabasePostgres = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase');

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      ssl: isSupabasePostgres || process.env.DATABASE_SSL === 'true' 
        ? { rejectUnauthorized: false } 
        : false
    });

    const client = await pool.connect();
    isPostgresConnected = true;
    console.log(`[Database] Connected successfully to ${isSupabasePostgres ? 'Supabase Cloud PostgreSQL' : 'PostgreSQL'}.`);

    // Auto-create tables if they don't exist
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

    // Check if users exist in PG, if not seed them
    const existingUsers = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count, 10) === 0) {
      console.log('[Database] Seeding initial PostgreSQL data...');
      for (const u of inMemoryStore.users) {
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, role, department, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING`,
          [u.id, u.name, u.email, u.password_hash, u.role, u.department, u.created_at]
        );
      }
      for (const d of inMemoryStore.documents) {
        await client.query(
          `INSERT INTO documents (id, title, department, file_type, raw_content, ai_summary, extracted_entities, uploaded_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [d.id, d.title, d.department, d.file_type, d.raw_content, d.ai_summary, JSON.stringify(d.extracted_entities), d.uploaded_by, d.created_at]
        );
      }
      for (const w of inMemoryStore.workflows) {
        await client.query(
          `INSERT INTO workflows (id, title, description, department, status, priority, assigned_to, ai_suggestions, due_date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [w.id, w.title, w.description, w.department, w.status, w.priority, w.assigned_to, JSON.stringify(w.ai_suggestions), w.due_date, w.created_at]
        );
      }
      for (const a of inMemoryStore.audit_logs) {
        await client.query(
          `INSERT INTO audit_logs (id, user_id, action, details, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [a.id, a.user_id, a.action, JSON.stringify(a.details), a.created_at]
        );
      }
      console.log('[Database] PostgreSQL seed completed.');
    }

    client.release();
  } catch (err) {
    console.warn(`[Database] PostgreSQL connection failed (${err.message}). Defaulting to in-memory persistence engine.`);
    isPostgresConnected = false;
  }
};

// Universal Query Interface that executes on PG if active, or falls back seamlessly
export const query = async (text, params = []) => {
  if (isPostgresConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (pgErr) {
      console.error('[Database PG Error]:', pgErr.message);
      throw pgErr;
    }
  }

  // In-Memory SQL Query Interceptor / Emulation
  return executeInMemoryQuery(text, params);
};

const executeInMemoryQuery = (text, params) => {
  const normalized = text.trim().toLowerCase();

  // 1. SELECT from users
  if (normalized.startsWith('select') && normalized.includes('from users')) {
    if (normalized.includes('where email = $1')) {
      const user = inMemoryStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
      return { rows: user ? [user] : [] };
    }
    if (normalized.includes('where id = $1')) {
      const user = inMemoryStore.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [] };
    }
    if (normalized.includes('department = $1')) {
      const users = inMemoryStore.users.filter(u => u.department === params[0]);
      return { rows: users };
    }
    return { rows: [...inMemoryStore.users] };
  }

  // 2. INSERT into users
  if (normalized.startsWith('insert into users')) {
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

  // 3. SELECT from documents
  if (normalized.startsWith('select') && normalized.includes('from documents')) {
    let docs = [...inMemoryStore.documents];
    if (normalized.includes('where id = $1')) {
      docs = docs.filter(d => d.id === params[0]);
    } else if (normalized.includes('where department = $1')) {
      docs = docs.filter(d => d.department === params[0]);
    }
    // enrich with uploader name
    const enriched = docs.map(d => {
      const uploader = inMemoryStore.users.find(u => u.id === d.uploaded_by);
      return {
        ...d,
        uploader_name: uploader ? uploader.name : 'System Ingestion',
        uploader_email: uploader ? uploader.email : 'system@synapse.ai'
      };
    });
    // sort desc
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  // 4. INSERT into documents
  if (normalized.startsWith('insert into documents')) {
    const newDoc = {
      id: uuidv4(),
      title: params[0],
      department: params[1],
      file_type: params[2],
      raw_content: params[3],
      ai_summary: params[4],
      extracted_entities: typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5],
      uploaded_by: params[6],
      created_at: new Date().toISOString()
    };
    inMemoryStore.documents.unshift(newDoc);
    return { rows: [newDoc] };
  }

  // 5. DELETE from documents
  if (normalized.startsWith('delete from documents')) {
    const idx = inMemoryStore.documents.findIndex(d => d.id === params[0]);
    if (idx !== -1) {
      const removed = inMemoryStore.documents.splice(idx, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  // 6. SELECT from workflows
  if (normalized.startsWith('select') && normalized.includes('from workflows')) {
    let workflows = [...inMemoryStore.workflows];
    if (normalized.includes('where id = $1')) {
      workflows = workflows.filter(w => w.id === params[0]);
    } else if (normalized.includes('where department = $1')) {
      workflows = workflows.filter(w => w.department === params[0]);
    }
    const enriched = workflows.map(w => {
      const assignee = inMemoryStore.users.find(u => u.id === w.assigned_to);
      return {
        ...w,
        assignee_name: assignee ? assignee.name : 'Unassigned',
        assignee_email: assignee ? assignee.email : null
      };
    });
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  // 7. INSERT into workflows
  if (normalized.startsWith('insert into workflows')) {
    const newWf = {
      id: uuidv4(),
      title: params[0],
      description: params[1],
      department: params[2],
      status: params[3] || 'backlog',
      priority: params[4] || 'medium',
      assigned_to: params[5] || null,
      ai_suggestions: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
      due_date: params[7] ? new Date(params[7]).toISOString() : null,
      created_at: new Date().toISOString()
    };
    inMemoryStore.workflows.unshift(newWf);
    return { rows: [newWf] };
  }

  // 8. UPDATE workflows
  if (normalized.startsWith('update workflows')) {
    const id = params[params.length - 1];
    const wf = inMemoryStore.workflows.find(w => w.id === id);
    if (wf) {
      if (normalized.includes('status = $1') && normalized.includes('assigned_to = $2')) {
        wf.status = params[0];
        wf.assigned_to = params[1];
      } else if (normalized.includes('status = $1')) {
        wf.status = params[0];
      } else if (normalized.includes('assigned_to = $1')) {
        wf.assigned_to = params[0];
      }
      return { rows: [wf] };
    }
    return { rows: [] };
  }

  // 9. DELETE from workflows
  if (normalized.startsWith('delete from workflows')) {
    const idx = inMemoryStore.workflows.findIndex(w => w.id === params[0]);
    if (idx !== -1) {
      const removed = inMemoryStore.workflows.splice(idx, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  // 10. INSERT into audit_logs
  if (normalized.startsWith('insert into audit_logs')) {
    const log = {
      id: uuidv4(),
      user_id: params[0],
      action: params[1],
      details: typeof params[2] === 'string' ? JSON.parse(params[2]) : params[2],
      created_at: new Date().toISOString()
    };
    inMemoryStore.audit_logs.unshift(log);
    return { rows: [log] };
  }

  // 11. SELECT from audit_logs
  if (normalized.startsWith('select') && normalized.includes('from audit_logs')) {
    const enriched = inMemoryStore.audit_logs.map(log => {
      const user = inMemoryStore.users.find(u => u.id === log.user_id);
      return {
        ...log,
        user_name: user ? user.name : 'System',
        user_email: user ? user.email : 'system@synapse.ai',
        user_role: user ? user.role : 'system',
        user_department: user ? user.department : 'operations'
      };
    });
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  // Default fallback
  return { rows: [] };
};

export const getDbStatus = () => ({
  mode: isPostgresConnected 
    ? (isSupabasePostgres ? 'Supabase Managed Cloud PostgreSQL' : 'PostgreSQL (Live Connection Pool)')
    : 'Resilient In-Memory Enterprise Engine',
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

