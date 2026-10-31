import { query } from '../config/db.js';
import { generateWorkflowBreakdown } from '../services/geminiService.js';
import { logAuditEvent } from '../services/auditService.js';

export const getWorkflows = async (req, res) => {
  try {
    const { department, status, priority } = req.query;
    let sql = 'SELECT * FROM workflows';
    const params = [];
    const conditions = [];

    if (department && department !== 'all') {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    } else if (req.user.role === 'employee') {
      params.push(req.user.department);
      conditions.push(`department = $${params.length}`);
    }

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (priority && priority !== 'all') {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(sql, params);
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      workflows: result.rows
    });
  } catch (error) {
    console.error('[Workflow Controller Get Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflows.'
    });
  }
};

export const createWorkflow = async (req, res) => {
  try {
    const { title, description, department, priority = 'medium', dueDate, assignedTo } = req.body;

    console.log(`[Workflow Creation] Generating AI breakdown for "${title}"...`);

    // AI subtask breakdown & risk analysis via Gemini
    const aiSuggestions = await generateWorkflowBreakdown({
      title,
      description,
      department,
      priority
    });

    const parsedDueDate = dueDate ? new Date(dueDate).toISOString() : null;
    const suggestionsJson = JSON.stringify(aiSuggestions);

    const result = await query(
      `INSERT INTO workflows (title, description, department, status, priority, assigned_to, ai_suggestions, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description || '', department, 'backlog', priority, assignedTo || null, suggestionsJson, parsedDueDate]
    );

    const newWorkflow = result.rows[0];

    await logAuditEvent(req.user.id, 'CREATE_WORKFLOW', {
      workflowId: newWorkflow.id,
      title: newWorkflow.title,
      department: newWorkflow.department,
      priority: newWorkflow.priority,
      subtasksGenerated: aiSuggestions.recommendedSubtasks?.length || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Workflow initiative created with AI subtask breakdown.',
      workflow: newWorkflow,
      aiBreakdown: aiSuggestions
    });
  } catch (error) {
    console.error('[Workflow Controller Create Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create workflow initiative.'
    });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, title, description } = req.body;

    // Check if workflow exists
    const existing = await query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow task not found.'
      });
    }

    const current = existing.rows[0];

    // Department boundary check for employees
    if (req.user.role === 'employee' && current.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update workflows within your department.'
      });
    }

    let updateSql = 'UPDATE workflows SET ';
    const updates = [];
    const params = [];

    if (status) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      updates.push(`priority = $${params.length}`);
    }
    if (assignedTo !== undefined) {
      params.push(assignedTo);
      updates.push(`assigned_to = $${params.length}`);
    }
    if (title) {
      params.push(title);
      updates.push(`title = $${params.length}`);
    }
    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(200).json({
        success: true,
        workflow: current
      });
    }

    params.push(id);
    updateSql += updates.join(', ') + ` WHERE id = $${params.length} RETURNING *`;

    const result = await query(updateSql, params);
    const updatedWf = result.rows[0];

    await logAuditEvent(req.user.id, 'UPDATE_WORKFLOW', {
      workflowId: id,
      previousStatus: current.status,
      newStatus: status || current.status,
      assignedTo: assignedTo !== undefined ? assignedTo : current.assigned_to
    });

    return res.status(200).json({
      success: true,
      message: 'Workflow status updated successfully.',
      workflow: updatedWf
    });
  } catch (error) {
    console.error('[Workflow Controller Update Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update workflow.'
    });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM workflows WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found.'
      });
    }

    const wf = existing.rows[0];

    // Restrict deletion to Admin and Department Manager
    if (req.user.role === 'employee' || (req.user.role === 'manager' && req.user.department !== wf.department)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Only Admins or Department Managers can delete workflows.'
      });
    }

    await query('DELETE FROM workflows WHERE id = $1', [id]);

    await logAuditEvent(req.user.id, 'DELETE_WORKFLOW', {
      workflowId: id,
      title: wf.title,
      department: wf.department
    });

    return res.status(200).json({
      success: true,
      message: 'Workflow initiative deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete workflow.'
    });
  }
};

