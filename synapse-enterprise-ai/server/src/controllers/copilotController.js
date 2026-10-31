import { query } from '../config/db.js';
import { queryCopilotWithRAG } from '../services/geminiService.js';
import { logAuditEvent } from '../services/auditService.js';

export const askCopilot = async (req, res) => {
  try {
    const { query: userQuery, departmentFilter = 'all' } = req.body;

    // Fetch grounded context from documents
    let docSql = 'SELECT id, title, department, ai_summary, raw_content, extracted_entities FROM documents';
    const docParams = [];
    if (departmentFilter !== 'all') {
      docSql += ' WHERE department = $1';
      docParams.push(departmentFilter);
    }
    const docResults = await query(docSql, docParams);

    // Fetch grounded context from workflows
    let wfSql = 'SELECT id, title, department, status, priority, description, ai_suggestions FROM workflows';
    const wfParams = [];
    if (departmentFilter !== 'all') {
      wfSql += ' WHERE department = $1';
      wfParams.push(departmentFilter);
    }
    const wfResults = await query(wfSql, wfParams);

    console.log(`[Copilot] Processing enterprise query: "${userQuery}" with RAG grounding (${docResults.rows.length} docs, ${wfResults.rows.length} workflows)...`);

    // Call Gemini with RAG context
    const aiResponse = await queryCopilotWithRAG({
      query: userQuery,
      departmentFilter,
      contextDocuments: docResults.rows,
      contextWorkflows: wfResults.rows
    });

    await logAuditEvent(req.user.id, 'COPILOT_QUERY', {
      query: userQuery,
      departmentFilter,
      citationsCount: aiResponse.groundingCitations?.length || 0
    });

    return res.status(200).json({
      success: true,
      query: userQuery,
      response: aiResponse,
      groundedMetadata: {
        documentsConsidered: docResults.rows.length,
        workflowsConsidered: wfResults.rows.length,
        departmentFilter
      }
    });
  } catch (error) {
    console.error('[Copilot Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process Copilot query.'
    });
  }
};

