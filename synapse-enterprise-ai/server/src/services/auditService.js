import { query } from '../config/db.js';

export const logAuditEvent = async (userId, action, details = {}) => {
  try {
    const text = `
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [userId || null, action, JSON.stringify(details)];
    const result = await query(text, values);
    return result.rows[0];
  } catch (error) {
    console.error('[Audit Service Error]: Failed to record audit event:', error.message);
    // Non-blocking for primary application flow
    return null;
  }
};

