import { query, getDbStatus } from '../config/db.js';
import { getGeminiStatus } from '../config/gemini.js';
import { checkSupabaseHealth } from '../config/supabase.js';
import { generateExecutiveBriefing } from '../services/geminiService.js';
import { logAuditEvent } from '../services/auditService.js';

export const getSummary = async (req, res) => {
  try {
    const docsResult = await query('SELECT id, title, department, file_type, created_at, ai_summary, extracted_entities FROM documents');
    const workflowsResult = await query('SELECT id, title, department, status, priority, due_date, created_at, ai_suggestions FROM workflows');
    const auditResult = await query('SELECT COUNT(*) FROM audit_logs');

    const documents = docsResult.rows;
    const workflows = workflowsResult.rows;
    const auditCount = parseInt(auditResult.rows[0]?.count || auditResult.rows.length || 0, 10);

    // KPI Aggregations
    const totalWorkflows = workflows.length;
    const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
    const inProgressWorkflows = workflows.filter(w => w.status === 'in_progress').length;
    const backlogWorkflows = workflows.filter(w => w.status === 'backlog').length;
    const reviewWorkflows = workflows.filter(w => w.status === 'review').length;
    const criticalWorkflows = workflows.filter(w => w.priority === 'critical').length;
    const highWorkflows = workflows.filter(w => w.priority === 'high').length;

    const completionRate = totalWorkflows > 0 ? Math.round((completedWorkflows / totalWorkflows) * 100) : 0;

    // Department Breakdown
    const departments = ['finance', 'hr', 'engineering', 'operations', 'product'];
    const departmentMetrics = departments.map(dept => {
      const deptDocs = documents.filter(d => d.department === dept);
      const deptWorkflows = workflows.filter(w => w.department === dept);
      const deptCompleted = deptWorkflows.filter(w => w.status === 'completed').length;

      // Extract sentiment indicators from ingested documents
      let positive = 0;
      let negative = 0;
      let neutral = 0;
      deptDocs.forEach(d => {
        const sentiment = d.extracted_entities?.sentiment || 'Neutral';
        if (sentiment.toLowerCase() === 'positive') positive++;
        else if (sentiment.toLowerCase() === 'negative') negative++;
        else neutral++;
      });

      return {
        department: dept,
        documentsCount: deptDocs.length,
        workflowsCount: deptWorkflows.length,
        completedCount: deptCompleted,
        completionRate: deptWorkflows.length > 0 ? Math.round((deptCompleted / deptWorkflows.length) * 100) : 100,
        sentiment: {
          positive,
          negative,
          neutral
        }
      };
    });

    // Recent activity feed
    const recentAuditResult = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 8');

    return res.status(200).json({
      success: true,
      kpis: {
        totalDocuments: documents.length,
        totalWorkflows,
        completedWorkflows,
        inProgressWorkflows,
        backlogWorkflows,
        reviewWorkflows,
        criticalWorkflows,
        highWorkflows,
        completionRate,
        totalAuditEvents: auditCount,
        automationSavingsHours: Math.round(totalWorkflows * 4.5 + documents.length * 3.2)
      },
      departmentMetrics,
      recentActivity: recentAuditResult.rows,
      recentDocuments: documents.slice(0, 5),
      urgentWorkflows: workflows.filter(w => (w.priority === 'critical' || w.priority === 'high') && w.status !== 'completed').slice(0, 5)
    });
  } catch (error) {
    console.error('[Analytics Controller Summary Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to aggregate analytics summary.'
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { action, limit = 50, page = 1 } = req.query;
    let sql = 'SELECT * FROM audit_logs';
    const params = [];

    if (action) {
      sql += ' WHERE action = $1';
      params.push(action);
    }

    const result = await query(sql, params);
    const logs = result.rows;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;
    const paginated = logs.slice(offset, offset + parsedLimit);

    return res.status(200).json({
      success: true,
      total: logs.length,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(logs.length / parsedLimit) || 1,
      logs: paginated
    });
  } catch (error) {
    console.error('[Analytics Audit Logs Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs.'
    });
  }
};

export const createExecutiveBriefing = async (req, res) => {
  try {
    const docs = await query('SELECT title, department, file_type, ai_summary FROM documents');
    const wfs = await query('SELECT title, department, status, priority, ai_suggestions FROM workflows');
    const audits = await query('SELECT COUNT(*) FROM audit_logs');

    const briefingMarkdown = await generateExecutiveBriefing({
      documents: docs.rows,
      workflows: wfs.rows,
      auditCount: audits.rows[0]?.count || audits.rows.length || 0
    });

    await logAuditEvent(req.user.id, 'GENERATE_EXECUTIVE_BRIEFING', {
      briefingLength: briefingMarkdown.length
    });

    return res.status(200).json({
      success: true,
      briefing: briefingMarkdown,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Briefing Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate automated executive briefing.'
    });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    const geminiStatus = getGeminiStatus();
    const supabaseStatus = await checkSupabaseHealth();

    return res.status(200).json({
      success: true,
      system: 'Synapse Enterprise AI Core',
      version: '1.0.0-production',
      architecture: 'Tri-System: Client (Vercel) + Server (Render) + Backend (Supabase)',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database: dbStatus,
      supabase: supabaseStatus,
      aiEngine: geminiStatus,
      render: {
        isRender: Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL),
        externalUrl: process.env.RENDER_EXTERNAL_URL || null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Health inspection failed.'
    });
  }
};

