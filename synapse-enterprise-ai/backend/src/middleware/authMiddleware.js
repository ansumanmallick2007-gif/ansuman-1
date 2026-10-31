import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_2026';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or token invalid. Please log in again.'
      });
    }

    // Retrieve user by ID
    const userResult = await query('SELECT id, name, email, role, department, created_at FROM users WHERE id = $1', [decoded.id]);
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Authenticated user account not found or has been revoked.'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server authorization error'
    });
  }
};

