-- ==============================================================================
-- SYNAPSE ENTERPRISE AI — SUPABASE SEED DATA SCRIPT
-- Paste into Supabase SQL Editor to populate with enterprise personas and records
-- ==============================================================================

-- Password for all accounts is: Synapse2026!
-- Hash generated using bcrypt 12 salt rounds:
-- $2a$12$K12x9vB5cqvIeFqYj7UvpeJbXj2Wp8Nl1P7nU.rYgR7pM4C6w5Gz.

INSERT INTO public.users (id, name, email, password_hash, role, department)
VALUES 
  ('11111111-1111-4111-a111-111111111111', 'Sarah Connor (Executive Admin)', 'admin@synapse.ai', '$2a$12$K12x9vB5cqvIeFqYj7UvpeJbXj2Wp8Nl1P7nU.rYgR7pM4C6w5Gz.', 'admin', 'operations'),
  ('22222222-2222-4222-a222-222222222222', 'Marcus Vance (Finance Lead)', 'finance.lead@synapse.ai', '$2a$12$K12x9vB5cqvIeFqYj7UvpeJbXj2Wp8Nl1P7nU.rYgR7pM4C6w5Gz.', 'manager', 'finance'),
  ('33333333-3333-4333-a333-333333333333', 'Elena Rostova (VP Engineering)', 'eng.lead@synapse.ai', '$2a$12$K12x9vB5cqvIeFqYj7UvpeJbXj2Wp8Nl1P7nU.rYgR7pM4C6w5Gz.', 'manager', 'engineering'),
  ('44444444-4444-4444-a444-444444444444', 'Alex Rivera (Staff Engineer)', 'employee@synapse.ai', '$2a$12$K12x9vB5cqvIeFqYj7UvpeJbXj2Wp8Nl1P7nU.rYgR7pM4C6w5Gz.', 'employee', 'engineering')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.documents (id, title, department, file_type, raw_content, ai_summary, extracted_entities, uploaded_by)
VALUES
  (
    'doc-001-uuid',
    'Q3 Financial Health & EBITDA Reconciliation',
    'finance',
    'Financial Report',
    'Q3 EBITDA margin expanded 320 bps YoY to 28.4%. Operating cash flow reached $42.5M, driven by enterprise ARR growth of 41%. Cloud infrastructure expenditure was reduced by 14% via model distillation and automated query routing. Headcount growth is capped at 5% for Q4.',
    'Enterprise ARR increased 41% YoY with EBITDA margin reaching 28.4% ($42.5M OCF). Cloud compute costs dropped 14% via model optimizations. Q4 hiring capped at 5%.',
    '{"financials": ["$42.5M Operating Cash Flow", "28.4% EBITDA Margin", "+41% ARR Growth"], "sentiment": "Positive", "keyEntities": ["EBITDA Margin", "Operating Cash Flow", "Q4 Hiring Cap"], "actionItems": ["Audit foreign entity tax credits", "Monitor Q4 hiring caps"]}'::jsonb,
    '22222222-2222-4222-a222-222222222222'
  ),
  (
    'doc-002-uuid',
    'Global Remote Work & Compliance Framework 2026',
    'hr',
    'HR Policy',
    'This policy governs all asynchronous distributed workers across 14 jurisdictions. Mandatory security token hardware keys required by November 15. Annual training for AI ethics and customer data governance must be completed by all staff before Dec 1.',
    'Distributed work governance covering 14 jurisdictions. Hard deadlines for hardware security tokens (Nov 15) and AI ethics/data compliance certification (Dec 1).',
    '{"sentiment": "Neutral", "keyEntities": ["14 jurisdictions", "FIDO2 security tokens", "Dec 1 Compliance"], "actionItems": ["Distribute hardware security keys", "Host compliance training"]}'::jsonb,
    '11111111-1111-4111-a111-111111111111'
  ),
  (
    'doc-003-uuid',
    'Microservices Mesh & Zero-Trust Architecture Spec',
    'engineering',
    'Technical Spec',
    'Migration from legacy monolithic gateway to Envoy-based Service Mesh with mTLS. Target p99 latency < 18ms. Gemini model gateway failover will utilize regional fallback clusters in us-east and europe-west.',
    'Service mesh overhaul using Envoy and mTLS targeting <18ms p99 latency. Incorporates automated regional failover clusters for high-availability Gemini API inference.',
    '{"sentiment": "Positive", "keyEntities": ["Envoy Mesh", "p99 < 18ms", "Gemini Failover"], "actionItems": ["Deploy Envoy sidecars to staging", "Benchmark mTLS handshake latency"]}'::jsonb,
    '33333333-3333-4333-a333-333333333333'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workflows (id, title, description, department, status, priority, assigned_to, ai_suggestions, due_date)
VALUES
  (
    'wf-001-uuid',
    'Audit & Automate Cross-Border Tax Filings',
    'Reconcile multi-currency sales ledger across EMEA and APAC branches with automated Gemini discrepancy checks.',
    'finance',
    'in_progress',
    'critical',
    '22222222-2222-4222-a222-222222222222',
    '{"recommendedSubtasks": [{"title": "Extract VAT logs", "estimatedHours": 4, "suggestedDepartment": "finance"}, {"title": "Verify variances", "estimatedHours": 6, "suggestedDepartment": "finance"}], "riskAssessment": "FX volatility could cause 2.3% variance."}'::jsonb,
    NOW() + INTERVAL '5 days'
  ),
  (
    'wf-002-uuid',
    'Deploy Gemini Multimodal Extraction Service v2',
    'Upgrade document ingestion pipeline to support high-throughput financial statements and real-time structured telemetry parsing.',
    'engineering',
    'review',
    'high',
    '44444444-4444-4444-a444-444444444444',
    '{"recommendedSubtasks": [{"title": "Implement Zod schemas", "estimatedHours": 6, "suggestedDepartment": "engineering"}, {"title": "OCR benchmarks", "estimatedHours": 8, "suggestedDepartment": "product"}], "riskAssessment": "Watch token consumption during batch imports."}'::jsonb,
    NOW() + INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (user_id, action, details)
VALUES 
  ('11111111-1111-4111-a111-111111111111', 'INIT_SYSTEM', '{"message": "Synapse Enterprise AI linked with Supabase Managed PostgreSQL"}'::jsonb);

